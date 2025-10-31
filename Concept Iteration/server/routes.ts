import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { insertUserSchema, updateUserSchema, loginSchema, insertStudentSchema, updateStudentSchema, insertIncidentSchema, updateIncidentSchema } from "@shared/schema";
import { sendChatMessage, extractABCData, type ChatMessage } from "./groq";

// Session middleware
function setupSession(app: Express) {
  console.log("Setting up session middleware...");
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("SESSION_SECRET exists:", !!process.env.SESSION_SECRET);
  
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Allow creating the sessions table if it doesn't exist
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: app.get("env") !== "development",
        sameSite: "lax",
        maxAge: sessionTtl,
      },
    })
  );
  
  console.log("Session middleware setup complete");
}

// Auth middleware to protect routes
export const isAuthenticated = (req: Request, res: Response, next: Function) => {
  console.log("Auth check - session exists:", !!req.session);
  console.log("Auth check - userId:", (req.session as any)?.userId);
  
  if (req.session && (req.session as any).userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session FIRST before any routes
  setupSession(app);
  
  // Add middleware to log session status on all requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Session exists: ${!!req.session}, SessionID: ${req.session?.id}`);
    next();
  });

  // Students
  app.get("/api/students", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId as string;
      console.log("Fetching students for user:", userId);
      
      const rows = await storage.listStudents(userId);
      console.log("Found students:", rows.length);
      
      res.json(rows);
    } catch (err: any) {
      console.error("Error fetching students:", err);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId as string;
      
      if (!userId) {
        console.error("UserId not found in session");
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      console.log("Creating student for user:", userId, "with data:", req.body);
      
      // Validate the request body (should NOT include userId)
      const data = insertStudentSchema.parse(req.body);
      console.log("Validated student data:", data);
      
      // Create student with userId from session
      const row = await storage.createStudent(userId, data);
      console.log("Created student successfully:", row);
      
      res.status(201).json(row);
    } catch (err: any) {
      console.error("Error creating student:", err);
      
      // Better error messages for validation errors
      if (err.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid student data", 
          errors: err.errors 
        });
      }
      
      res.status(400).json({ message: err.message || "Invalid student data" });
    }
  });

  app.get("/api/students/:id", isAuthenticated, async (req, res) => {
    const userId = (req.session as any).userId as string;
    const id = Number(req.params.id);
    const row = await storage.getStudent(id, userId);
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  app.patch("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId as string;
      const id = Number(req.params.id);
      const data = updateStudentSchema.parse(req.body);
      const row = await storage.updateStudent(id, userId, data);
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Invalid student data" });
    }
  });

  app.delete("/api/students/:id", isAuthenticated, async (req, res) => {
    const userId = (req.session as any).userId as string;
    const id = Number(req.params.id);
    const ok = await storage.deleteStudent(id, userId);
    res.json({ success: ok });
  });

  // Incidents
  app.get("/api/incidents", isAuthenticated, async (req, res) => {
    const userId = (req.session as any).userId as string;
    const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
    const rows = await storage.listIncidents(userId, studentId);
    res.json(rows);
  });

  app.post("/api/incidents", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId as string;
      const data = insertIncidentSchema.parse(req.body);
      const row = await storage.createIncident(userId, data);
      res.json(row);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Invalid incident data" });
    }
  });

  app.get("/api/incidents/:id", isAuthenticated, async (req, res) => {
    const userId = (req.session as any).userId as string;
    const id = Number(req.params.id);
    const row = await storage.getIncident(id, userId);
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  app.patch("/api/incidents/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId as string;
      const id = Number(req.params.id);
      const data = updateIncidentSchema.parse(req.body);
      const row = await storage.updateIncident(id, userId, data);
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Invalid incident data" });
    }
  });

  // Signup route
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log("Signup attempt with data:", req.body);
      console.log("Session before signup:", !!req.session);
      
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      const user = await storage.createUser(validatedData);
      console.log("User created:", user.id);
      
      // Defensive check for session
      if (!req.session) {
        console.error("Session is undefined during signup - session middleware may not be working");
        return res.status(500).json({ message: "Session initialization failed" });
      }
      
      // Set session with additional error handling
      try {
        (req.session as any).userId = user.id;
        console.log("Session userId set to:", user.id);
        
        // Force session save to ensure it's persisted
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              reject(err);
            } else {
              console.log("Session saved successfully");
              resolve();
            }
          });
        });
      } catch (sessionError) {
        console.error("Error setting session:", sessionError);
        return res.status(500).json({ message: "Failed to create session" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(400).json({ message: error.message || "Signup failed" });
    }
  });

  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.authenticateUser(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Defensive check for session
      if (!req.session) {
        console.error("Session is undefined during login");
        return res.status(500).json({ message: "Session initialization failed" });
      }

      // Set session
      (req.session as any).userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    if (!req.session) {
      return res.status(400).json({ message: "No session to destroy" });
    }
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user route
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      console.log("[Update User] Request body keys:", Object.keys(req.body));
      console.log("[Update User] photoUrl length:", req.body.photoUrl?.length);
      
      // Manual validation instead of Zod to avoid pattern issues
      const data: { firstName?: string; lastName?: string; photoUrl?: string; emailNotifications?: string; draftReminders?: string } = {};
      
      if (req.body.firstName !== undefined && req.body.firstName !== null) {
        data.firstName = String(req.body.firstName);
      }
      if (req.body.lastName !== undefined && req.body.lastName !== null) {
        data.lastName = String(req.body.lastName);
      }
      if (req.body.photoUrl !== undefined && req.body.photoUrl !== null) {
        data.photoUrl = String(req.body.photoUrl);
      }
      if (req.body.emailNotifications !== undefined && req.body.emailNotifications !== null) {
        data.emailNotifications = String(req.body.emailNotifications);
      }
      if (req.body.draftReminders !== undefined && req.body.draftReminders !== null) {
        data.draftReminders = String(req.body.draftReminders);
      }
      
      console.log("[Update User] Processed data:", { ...data, photoUrl: data.photoUrl ? `${data.photoUrl.substring(0, 50)}... (${data.photoUrl.length} chars)` : undefined });
      
      const updatedUser = await storage.updateUser(userId, data);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("[Update User] Error:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3),
      });
      
      res.status(400).json({ message: error.message || "Failed to update user" });
    }
  });

  // Delete user account
  app.delete("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete account" });
      }

      // Destroy session after deleting account
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
      });

      res.json({ message: "Account deleted successfully" });
    } catch (error: any) {
      console.error("[Delete User] Error:", error);
      res.status(400).json({ message: error.message || "Failed to delete account" });
    }
  });

  // Chatbot routes
  app.post("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }

      console.log("Chat request with", messages.length, "messages");
      
      const response = await sendChatMessage(messages);
      res.json({ message: response });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ message: error.message || "Failed to process chat message" });
    }
  });

  app.post("/api/chat/extract-abc", isAuthenticated, async (req, res) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }

      console.log("Extracting ABC data from", messages.length, "messages");
      
      const abcData = await extractABCData(messages);
      res.json(abcData);
    } catch (error: any) {
      console.error("ABC extraction error:", error);
      res.status(500).json({ message: error.message || "Failed to extract ABC data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
