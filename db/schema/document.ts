import { relations } from "drizzle-orm";
import {integer, pgEnum, pgTable, serial, text, timestamp, varchar,} from "drizzle-orm/pg-core";
import { personalInfoTable } from "./personal-info";
import { experienceTable } from "./experience";
import { educationTable } from "./education";
import { skillsTable } from "./skills";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const statusEnum = pgEnum("status", ["archived", "private", "public"]);

export const documentTable = pgTable("document", {
  id: serial("id").notNull().primaryKey(),
  documentId: varchar("document_id").unique().notNull(),
  userId: varchar("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  themeColor: varchar("theme_color", { length: 255 })
    .notNull()
    .default("#7c3aed"),
  thumbnail: text("thumbnail"),
  currentPosition: integer("current_position").notNull().default(1),
  status: statusEnum("status").notNull().default("private"),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  authorEmail: varchar("author_email", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const documentRelations = relations(documentTable, ({ one, many }) => {
  return {
    personalInfo: one(personalInfoTable),
    experiences: many(experienceTable),
    educations: many(educationTable),
    skills: many(skillsTable),
  };
});

export const createDocumentTableSchema = createInsertSchema(documentTable, {
  title: (schema) => schema.title.min(1),
  themeColor: (schema) => schema.themeColor.optional(),
  thumbnail: (schema) => schema.thumbnail.optional(),
  currentPosition: (schema) => schema.currentPosition.optional(),
}).pick({
  title: true,
  status: true,
  summary: true,
  themeColor: true,
  thumbnail: true,
  currentPosition: true,
});

export type DocumentSchema = z.infer<typeof createDocumentTableSchema>;
