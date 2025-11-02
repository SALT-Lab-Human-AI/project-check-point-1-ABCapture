import { users, students, incidents, incidentEditHistory, type User, type InsertUser, type UpdateUser, type Student, type InsertStudent, type Incident, type InsertIncident, type InsertIncidentEditHistory } from "@shared/schema";
import { db } from "./db";
import { and, eq, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations for email/password auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: UpdateUser): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  createOrUpdateGoogleUser(profile: { googleId: string; email: string; displayName: string; firstName?: string; lastName?: string }, role: string): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  // Student operations
  listStudents(userId: string): Promise<Student[]>;
  getStudent(id: number, userId: string): Promise<Student | undefined>;
  createStudent(userId: string, data: InsertStudent): Promise<Student>;
  updateStudent(id: number, userId: string, data: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number, userId: string): Promise<boolean>;
  // Incident operations
  listIncidents(userId: string, studentId?: number): Promise<Incident[]>;
  getIncident(id: number, userId: string): Promise<Incident | undefined>;
  createIncident(userId: string, data: InsertIncident): Promise<Incident>;
  updateIncident(id: number, userId: string, data: Partial<InsertIncident>, editedByName?: string): Promise<Incident | undefined>;
  deleteIncident(id: number, userId: string): Promise<boolean>;
  getIncidentEditHistory(incidentId: number, userId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password before storing (only if password is provided)
    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 10) : null;
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    
    return user;
  }

  async updateUser(id: string, data: UpdateUser): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createOrUpdateGoogleUser(
    profile: { googleId: string; email: string; displayName: string; firstName?: string; lastName?: string },
    role: string
  ): Promise<User> {
    try {
      console.log('[Storage] createOrUpdateGoogleUser called for:', profile.email);
      
      // First, check if user exists with this Google ID
      let user = await this.getUserByGoogleId(profile.googleId);
      
      if (user) {
        // User exists with Google ID, return it
        console.log('[Storage] User found by Google ID:', user.id);
        return user;
      }

      // Check if user exists with this email (for account linking)
      user = await this.getUserByEmail(profile.email);
      
      if (user) {
        // Link Google account to existing email account
        console.log('[Storage] Linking Google account to existing user:', user.id);
        const [updatedUser] = await db
          .update(users)
          .set({
            googleId: profile.googleId,
            provider: 'google',
            displayName: profile.displayName,
          })
          .where(eq(users.id, user.id))
          .returning();
        console.log('[Storage] User updated successfully');
        return updatedUser;
      }

      // Create new user with Google OAuth
      console.log('[Storage] Creating new user with Google OAuth');
      const [newUser] = await db
        .insert(users)
        .values({
          email: profile.email,
          googleId: profile.googleId,
          provider: 'google',
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: role,
          password: null, // No password for OAuth users
        })
        .returning();
      
      console.log('[Storage] New user created:', newUser.id);
      return newUser;
    } catch (error) {
      console.error('[Storage] Error in createOrUpdateGoogleUser:', error);
      throw error;
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return null;
    }

    // Check if user has a password (local auth)
    if (!user.password) {
      return null; // OAuth-only user, cannot login with password
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  // Students
  async listStudents(userId: string): Promise<Student[]> {
    try {
      console.log("Storage: Listing students for userId:", userId);
      const rows = await db.select().from(students).where(eq(students.userId, userId));
      console.log("Storage: Found", rows.length, "students");
      return rows;
    } catch (error) {
      console.error("Storage: Error listing students:", error);
      throw error;
    }
  }

  async getStudent(id: number, userId: string): Promise<Student | undefined> {
    const [row] = await db
      .select()
      .from(students)
      .where(and(eq(students.id, id), eq(students.userId, userId)));
    return row;
  }

  async createStudent(userId: string, data: InsertStudent): Promise<Student> {
    try {
      console.log("Storage: Creating student with userId:", userId, "data:", data);
      const [row] = await db
        .insert(students)
        .values({ ...data, userId })
        .returning();
      console.log("Storage: Successfully created student:", row);
      return row;
    } catch (error) {
      console.error("Storage: Error creating student:", error);
      throw error;
    }
  }

  async updateStudent(id: number, userId: string, data: Partial<InsertStudent>): Promise<Student | undefined> {
    const [row] = await db
      .update(students)
      .set({ ...data })
      .where(and(eq(students.id, id), eq(students.userId, userId)))
      .returning();
    return row;
  }

  async deleteStudent(id: number, userId: string): Promise<boolean> {
    const deleted = await db
      .delete(students)
      .where(and(eq(students.id, id), eq(students.userId, userId)));
    // drizzle returns { rowCount?: number } depending on driver; fallback to truthy
    return !!(deleted as any)?.rowCount || true;
  }

  // Incidents
  async listIncidents(userId: string, studentId?: number): Promise<Incident[]> {
    const where = studentId ? and(eq(incidents.userId, userId), eq(incidents.studentId, studentId)) : eq(incidents.userId, userId);
    const rows = await db
      .select()
      .from(incidents)
      .where(where)
      .orderBy(desc(incidents.createdAt));
    return rows;
  }

  async getIncident(id: number, userId: string): Promise<Incident | undefined> {
    const [row] = await db
      .select()
      .from(incidents)
      .where(and(eq(incidents.id, id), eq(incidents.userId, userId)));
    return row;
  }

  async createIncident(userId: string, data: InsertIncident): Promise<Incident> {
    const [row] = await db
      .insert(incidents)
      .values({ ...data, userId })
      .returning();
    return row;
  }

  async updateIncident(id: number, userId: string, data: Partial<InsertIncident>, editedByName?: string): Promise<Incident | undefined> {
    // Get the original incident before updating
    const [original] = await db
      .select()
      .from(incidents)
      .where(and(eq(incidents.id, id), eq(incidents.userId, userId)));
    
    if (!original) return undefined;

    // Update the incident
    const [row] = await db
      .update(incidents)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(incidents.id, id), eq(incidents.userId, userId)))
      .returning();
    
    // Record edit history if there were actual changes
    if (row && Object.keys(data).length > 0) {
      const changes: Record<string, { old: any; new: any }> = {};
      
      console.log('[updateIncident] Checking for changes. Data keys:', Object.keys(data));
      
      for (const [key, newValue] of Object.entries(data)) {
        const oldValue = original[key as keyof typeof original];
        // Only record if value actually changed
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          console.log(`[updateIncident] Change detected in ${key}:`, { old: oldValue, new: newValue });
          changes[key] = { old: oldValue, new: newValue };
        }
      }
      
      // Only insert history if there were actual changes
      if (Object.keys(changes).length > 0) {
        console.log('[updateIncident] Inserting edit history:', { incidentId: id, changes, editedByName });
        const result = await db.insert(incidentEditHistory).values({
          incidentId: id,
          userId,
          changes,
          editedByName,
        });
        console.log('[updateIncident] Edit history inserted:', result);
      } else {
        console.log('[updateIncident] No changes detected, skipping edit history');
      }
    }
    
    return row;
  }

  async deleteIncident(id: number, userId: string): Promise<boolean> {
    try {
      const deleted = await db
        .delete(incidents)
        .where(and(eq(incidents.id, id), eq(incidents.userId, userId)));
      // drizzle returns { rowCount?: number } depending on driver; fallback to truthy
      return !!(deleted as any)?.rowCount || true;
    } catch (error) {
      console.error("Error deleting incident:", error);
      return false;
    }
  }

  async getIncidentEditHistory(incidentId: number, userId: string): Promise<any[]> {
    // First verify the user has access to this incident
    const incident = await this.getIncident(incidentId, userId);
    if (!incident) return [];

    // Fetch edit history ordered by most recent first
    const history = await db
      .select()
      .from(incidentEditHistory)
      .where(eq(incidentEditHistory.incidentId, incidentId))
      .orderBy(desc(incidentEditHistory.editedAt));
    
    return history;
  }
}

export const storage = new DatabaseStorage();
