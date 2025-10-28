import { users, students, incidents, type User, type InsertUser, type Student, type InsertStudent, type Incident, type InsertIncident } from "@shared/schema";
import { db } from "./db";
import { and, desc, eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations for email/password auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
  updateIncident(id: number, userId: string, data: Partial<InsertIncident>): Promise<Incident | undefined>;
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
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return null;
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

  async updateIncident(id: number, userId: string, data: Partial<InsertIncident>): Promise<Incident | undefined> {
    const [row] = await db
      .update(incidents)
      .set({ ...data })
      .where(and(eq(incidents.id, id), eq(incidents.userId, userId)))
      .returning();
    return row;
  }
}

export const storage = new DatabaseStorage();
