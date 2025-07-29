import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
  varchar,
  index,
  uuid,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table 
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Profiles table (linked to Supabase auth.users)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // References auth.users(id) from Supabase
  email: varchar("email").notNull(),
  username: text("username").unique().notNull(),
  name: text("name"),
  //zine_count: integer("zine_count"),
  //follower_count: integer("follower_count"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  contactInfo: json("contact_info").$type<{
    email?: string;
    phone?: string;
    social?: Record<string, string>;
  }>(),
  websiteUrl: text("website_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const zines = pgTable("zines", {
  id: uuid("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  videoUrl: text("video_url"),
  aspectRatio: text("aspect_ratio").notNull(), // "1:1", "4:5", "9:16"
  mediaType: text("media_type").notNull(), // "image", "video", "carousel"
  mediaUrls: jsonb("media_urls"), // array of urls for carousel
  creatorId: uuid("creator_id")
    .references(() => profiles.id)
    .notNull(),
  email: varchar("email"),
  username: text("username"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => profiles.id)
    .notNull(),
  email: varchar("email").notNull(),
  username: text("username"),
  zineId: integer("zine_id")
    .references(() => zines.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favoriteCreators = pgTable("favorite_creators", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => profiles.id)
    .notNull(),
  email: varchar("email").notNull(),
  username: text("username"),
  creatorId: uuid("creator_id")
    .references(() => profiles.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey(),
  title: text("title").notNull(),
  notes: text("notes"),
  userId: text("userId")
    .references(() => profiles.id)
    .notNull(),
  email: varchar("email").notNull(),
  username: text("username"),
  totalMinutes: integer("totalMinutes").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const focusSessions = pgTable("focus_sessions", {
  id: uuid("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => profiles.id)
    .notNull(),
  duration: integer("duration").notNull(), // in minutes
  sessionType: text("session_type").notNull(), // 'focus', 'short_break', 'long_break'
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginUserSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertZineSchema = createInsertSchema(zines).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteCreatorSchema = createInsertSchema(
  favoriteCreators,
).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({
  id: true,
  completedAt: true,
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;

export type Zine = typeof zines.$inferSelect;
export type InsertZine = z.infer<typeof insertZineSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type FavoriteCreator = typeof favoriteCreators.$inferSelect;
export type InsertFavoriteCreator = z.infer<typeof insertFavoriteCreatorSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type FocusSession = typeof focusSessions.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;

export type ZineWithCreator = Zine & {
  creator: Profile;
  isFavorited?: boolean;
  favoriteCount?: number;
};
