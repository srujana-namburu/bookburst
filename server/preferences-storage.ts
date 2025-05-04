import { db } from "./db";
import { userPreferences, type UserPreferences, type InsertUserPreferences } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export const preferencesStorage = {
  async getUserPreferences(userId: number): Promise<UserPreferences | null> {
    const preferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    return preferences[0] || null;
  },

  async updateUserPreferences(
    userId: number,
    updates: Partial<InsertUserPreferences>
  ): Promise<UserPreferences> {
    const existingPreferences = await this.getUserPreferences(userId);

    if (!existingPreferences) {
      const [newPreferences] = await db
        .insert(userPreferences)
        .values({ userId, ...updates })
        .returning();
      return newPreferences;
    }

    const [updatedPreferences] = await db
      .update(userPreferences)
      .set({
        ...updates,
        lastActiveTimestamp: new Date(),
      })
      .where(eq(userPreferences.userId, userId))
      .returning();

    return updatedPreferences;
  },

  async updateReadingTime(userId: number, additionalTime: number): Promise<void> {
    await db
      .update(userPreferences)
      .set({
        readingTime: sql`${userPreferences.readingTime} + ${additionalTime}`,
        lastActiveTimestamp: new Date(),
      })
      .where(eq(userPreferences.userId, userId));
  },

  async addRecentlyViewedBook(userId: number, bookId: number): Promise<void> {
    const preferences = await this.getUserPreferences(userId);
    const recentBooks = preferences?.recentlyViewedBooks || [];
    
    // Add new book to the beginning and limit to last 10
    const updatedBooks = [String(bookId), ...recentBooks.filter(id => id !== String(bookId))].slice(0, 10);
    
    await this.updateUserPreferences(userId, {
      recentlyViewedBooks: updatedBooks,
    });
  },
}; 