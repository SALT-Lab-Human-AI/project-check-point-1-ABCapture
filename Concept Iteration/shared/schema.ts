import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, serial, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with email/password and OAuth authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  password: varchar("password"), // Nullable for OAuth-only users
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").notNull(), // "teacher" or "administrator"
  photoUrl: text("photo_url"),
  emailNotifications: varchar("email_notifications").default('true'),
  draftReminders: varchar("draft_reminders").default('true'),
  // OAuth fields
  googleId: varchar("google_id").unique(), // Google OAuth ID
  provider: varchar("provider").notNull().default("local"), // "local" or "google"
  displayName: varchar("display_name"), // Full name from OAuth provider
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Very permissive schema for profile updates - accepts any optional strings
export const updateUserSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  emailNotifications: z.string().optional().nullable(),
  draftReminders: z.string().optional().nullable(),
}).passthrough(); // Allow any additional fields

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  grade: text("grade"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  userId: true, // userId is set by backend from session, not from frontend
  createdAt: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export const updateStudentSchema = insertStudentSchema.partial();

// Parents table (for tracking parents without login capability)
export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertParentSchema = createInsertSchema(parents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertParent = z.infer<typeof insertParentSchema>;
export type Parent = typeof parents.$inferSelect;

// Parent-Student relationship table (links parents to students)
export const parentStudents = pgTable("parent_students", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull().references(() => parents.id, { onDelete: "cascade" }),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParentStudentSchema = createInsertSchema(parentStudents).omit({
  id: true,
  createdAt: true,
});

export type InsertParentStudent = z.infer<typeof insertParentStudentSchema>;
export type ParentStudent = typeof parentStudents.$inferSelect;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  studentId: serial("student_id").references(() => students.id),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  incidentId: serial("incident_id").references(() => incidents.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: serial("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  studentId: serial("student_id").notNull().references(() => students.id),
  date: text("date").notNull(),
  time: text("time").notNull(),
  summary: text("summary").notNull(),
  antecedent: text("antecedent").notNull(),
  behavior: text("behavior").notNull(),
  consequence: text("consequence").notNull(),
  incidentType: text("incident_type").notNull(),
  functionOfBehavior: text("function_of_behavior").array().notNull(),
  location: text("location"),
  signature: text("signature"),
  signedAt: timestamp("signed_at"),
  status: text("status").notNull().default("draft"), // draft, signed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  userId: true, // userId is set by backend from session, not from frontend
  createdAt: true,
  updatedAt: true,
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;
export const updateIncidentSchema = insertIncidentSchema.partial();
