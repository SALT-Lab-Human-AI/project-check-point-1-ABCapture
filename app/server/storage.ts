import { users, students, incidents, incidentEditHistory, parents, parentStudents, type User, type InsertUser, type UpdateUser, type Student, type InsertStudent, type Incident, type InsertIncident, type InsertIncidentEditHistory } from "@shared/schema";
import { db } from "./db";
import { and, eq, desc, sql, count } from "drizzle-orm";
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
  // Parent operations
  createParent(parentData: { firstName: string; lastName: string; email: string }): Promise<any>;
  linkParentToStudent(parentId: number, studentId: number): Promise<void>;
  // Incident operations
  listIncidents(userId: string, studentId?: number, status?: string): Promise<Incident[]>;
  getIncident(id: number, userId: string): Promise<Incident | undefined>;
  createIncident(userId: string, data: InsertIncident): Promise<Incident>;
  updateIncident(id: number, userId: string, data: Partial<InsertIncident>, editedByName?: string): Promise<Incident | undefined>;
  deleteIncident(id: number, userId: string): Promise<boolean>;
  getIncidentEditHistory(incidentId: number, userId: string): Promise<any[]>;
  listIncidentsForStudent(studentId: number, status?: string): Promise<Incident[]>;
  // Admin operations
  listAllTeachers(): Promise<any[]>;
  getTeacherById(teacherId: string): Promise<User | undefined>;
  getTeacherStudents(teacherId: string): Promise<any[]>;
  listAllIncidents(): Promise<any[]>;
  getStudentForAdmin(studentId: number): Promise<Student | undefined>;
  getIncidentForAdmin(incidentId: number): Promise<Incident | undefined>;
  getIncidentEditHistoryForAdmin(incidentId: number): Promise<any[]>;
  getDashboardStats(): Promise<any>;
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

  // Parent operations
  async createParent(parentData: { firstName: string; lastName: string; email: string }): Promise<any> {
    const [parent] = await db
      .insert(parents)
      .values({
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        email: parentData.email,
      })
      .returning();
    return parent;
  }

  async linkParentToStudent(parentId: number, studentId: number): Promise<void> {
    await db
      .insert(parentStudents)
      .values({
        parentId,
        studentId,
      });
  }

  // Incidents
  async listIncidents(userId: string, studentId?: number, status?: string): Promise<Incident[]> {
    let where = studentId ? and(eq(incidents.userId, userId), eq(incidents.studentId, studentId)) : eq(incidents.userId, userId);
    if (status) {
      where = and(where, eq(incidents.status, status));
    }
    const rows = await db
      .select({
        id: incidents.id,
        studentId: incidents.studentId,
        date: incidents.date,
        time: incidents.time,
        summary: incidents.summary,
        antecedent: incidents.antecedent,
        behavior: incidents.behavior,
        consequence: incidents.consequence,
        incidentType: incidents.incidentType,
        functionOfBehavior: incidents.functionOfBehavior,
        location: incidents.location,
        signature: incidents.signature,
        signedAt: incidents.signedAt,
        status: incidents.status,
        userId: incidents.userId,
        createdAt: incidents.createdAt,
        updatedAt: incidents.updatedAt,
        studentName: students.name
      })
      .from(incidents)
      .leftJoin(students, eq(incidents.studentId, students.id))
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

  // Admin operations
  async listAllTeachers(): Promise<any[]> {
    const teachersWithCounts = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        photoUrl: users.photoUrl,
        createdAt: users.createdAt,
        studentCount: sql<number>`cast(count(${students.id}) as int)`,
      })
      .from(users)
      .leftJoin(students, eq(users.id, students.userId))
      .where(eq(users.role, 'teacher'))
      .groupBy(users.id)
      .orderBy(users.firstName, users.lastName);
    
    return teachersWithCounts;
  }

  async getTeacherById(teacherId: string): Promise<User | undefined> {
    const [teacher] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, teacherId), eq(users.role, 'teacher')));
    return teacher;
  }

  async getTeacherStudents(teacherId: string): Promise<any[]> {
    const studentsWithIncidentCounts = await db
      .select({
        id: students.id,
        name: students.name,
        grade: students.grade,
        incidentCount: sql<number>`cast(count(${incidents.id}) as int)`,
        lastIncidentDate: sql<string>`max(${incidents.date})`,
      })
      .from(students)
      .leftJoin(incidents, eq(students.id, incidents.studentId))
      .where(eq(students.userId, teacherId))
      .groupBy(students.id)
      .orderBy(students.name);
    
    return studentsWithIncidentCounts;
  }

  async listAllIncidents(): Promise<any[]> {
    const allIncidents = await db
      .select({
        id: incidents.id,
        date: incidents.date,
        time: incidents.time,
        studentId: incidents.studentId,
        studentName: students.name,
        userId: incidents.userId,
        teacherName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
        incidentType: incidents.incidentType,
        status: incidents.status,
        createdAt: incidents.createdAt,
      })
      .from(incidents)
      .innerJoin(students, eq(incidents.studentId, students.id))
      .innerJoin(users, eq(incidents.userId, users.id))
      .orderBy(desc(incidents.createdAt));
    
    return allIncidents;
  }

  async getStudentForAdmin(studentId: number): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId));
    return student;
  }

  async getIncidentForAdmin(incidentId: number): Promise<Incident | undefined> {
    const [incident] = await db
      .select()
      .from(incidents)
      .where(eq(incidents.id, incidentId));
    return incident;
  }

  async listIncidentsForStudent(studentId: number, status?: string): Promise<Incident[]> {
    let where = eq(incidents.studentId, studentId);
    if (status) {
      where = and(where, eq(incidents.status, status))!;
    }
    const rows = await db
      .select({
        id: incidents.id,
        studentId: incidents.studentId,
        date: incidents.date,
        time: incidents.time,
        summary: incidents.summary,
        antecedent: incidents.antecedent,
        behavior: incidents.behavior,
        consequence: incidents.consequence,
        incidentType: incidents.incidentType,
        functionOfBehavior: incidents.functionOfBehavior,
        location: incidents.location,
        signature: incidents.signature,
        signedAt: incidents.signedAt,
        status: incidents.status,
        userId: incidents.userId,
        createdAt: incidents.createdAt,
        updatedAt: incidents.updatedAt,
        studentName: students.name
      })
      .from(incidents)
      .leftJoin(students, eq(incidents.studentId, students.id))
      .where(where)
      .orderBy(desc(incidents.createdAt));
    return rows;
  }

  async getIncidentEditHistoryForAdmin(incidentId: number): Promise<any[]> {
    // Admin can view edit history for any incident without ownership check
    const history = await db
      .select()
      .from(incidentEditHistory)
      .where(eq(incidentEditHistory.incidentId, incidentId))
      .orderBy(desc(incidentEditHistory.editedAt));
    
    return history;
  }

  async getDashboardStats(): Promise<any> {
    console.log('[getDashboardStats] Fetching dashboard statistics...');
    
    // Get total teachers count
    const [teacherCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'teacher'));

    // Get total students count
    const [studentCount] = await db
      .select({ count: count() })
      .from(students);

    // Get recent incidents count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [recentIncidentCount] = await db
      .select({ count: count() })
      .from(incidents)
      .where(sql`${incidents.createdAt} >= ${thirtyDaysAgo.toISOString()}`);

    const totalTeachers = Number(teacherCount?.count ?? 0);
    const totalStudents = Number(studentCount?.count ?? 0);
    const totalActiveIncidents = Number(recentIncidentCount?.count ?? 0);
    const averageStudentsPerTeacher = totalTeachers > 0 ? totalStudents / totalTeachers : 0;

    console.log('[getDashboardStats] Stats:', {
      totalTeachers,
      totalStudents,
      averageStudentsPerTeacher,
      totalActiveIncidents
    });

    return {
      totalTeachers,
      totalStudents,
      averageStudentsPerTeacher,
      totalActiveIncidents,
    };
  }
}

export const storage = new DatabaseStorage();
