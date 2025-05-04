import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
});

export const usersRelations = relations(users, ({ many }) => ({
  userBooks: many(userBooks),
  followedBy: many(follows, { relationName: "followed" }),
  following: many(follows, { relationName: "follower" }),
}));

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  coverImage: text("cover_image"),
  genre: text("genre"),
  publicationDate: text("publication_date"),
  isbn: text("isbn"),
});

export const booksRelations = relations(books, ({ many }) => ({
  userBooks: many(userBooks),
}));

export const userBooks = pgTable("user_books", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bookId: integer("book_id").notNull().references(() => books.id),
  status: text("status").notNull(), // "reading", "finished", "want_to_read"
  progress: integer("progress"), // 0-100%
  rating: integer("rating"), // 1-5
  review: text("review"),
  isPublic: boolean("is_public").default(false),
  dateAdded: timestamp("date_added").defaultNow(),
  dateUpdated: timestamp("date_updated").defaultNow(),
});

export const userBooksRelations = relations(userBooks, ({ one }) => ({
  user: one(users, {
    fields: [userBooks.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [userBooks.bookId],
    references: [books.id],
  }),
}));

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followedId: integer("followed_id").notNull().references(() => users.id),
});

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  followed: one(users, {
    fields: [follows.followedId],
    references: [users.id],
    relationName: "followed",
  }),
}));

export const userPreferences = pgTable("user_preferences", {
  userId: integer("user_id").primaryKey().references(() => users.id),
  theme: text("theme").default("light"),
  lastActiveTab: text("last_active_tab"),
  recentlyViewedBooks: text("recently_viewed_books").array(),
  readingTime: integer("reading_time").default(0),
  lastActiveTimestamp: timestamp("last_active_timestamp").defaultNow(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

export const insertBookSchema = createInsertSchema(books);

export const insertUserBookSchema = createInsertSchema(userBooks).omit({
  id: true,
  dateAdded: true,
  dateUpdated: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export type InsertUserBook = z.infer<typeof insertUserBookSchema>;
export type UserBook = typeof userBooks.$inferSelect;

export type UserBookWithDetails = UserBook & {
  book: Book;
};

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
