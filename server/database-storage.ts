import { IStorage } from './storage';
import { User, Book, UserBook, UserBookWithDetails, InsertUser, InsertBook, InsertUserBook, users, books, userBooks, follows } from '@shared/schema';
import { db, pool } from './db';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const scryptAsync = promisify(scrypt);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        bio: null,
        profilePicture: null
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }

  async getActiveUsers(): Promise<User[]> {
    // Get all users, excluding sensitive info like passwords
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      bio: users.bio,
      profilePicture: users.profilePicture
    }).from(users);
    
    return allUsers;
  }

  // Book methods
  async getAllBooks(): Promise<Book[]> {
    return db.select().from(books);
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const [book] = await db.insert(books).values(insertBook).returning();
    return book;
  }

  // User Book methods
  async getUserBooks(userId: number): Promise<UserBookWithDetails[]> {
    const result = await db.select({
      userBook: userBooks,
      book: books
    }).from(userBooks)
      .innerJoin(books, eq(userBooks.bookId, books.id))
      .where(eq(userBooks.userId, userId));
    
    return result.map(row => ({
      ...row.userBook,
      book: row.book
    }));
  }

  async getUserBook(id: number): Promise<UserBook | undefined> {
    const [userBook] = await db.select().from(userBooks).where(eq(userBooks.id, id));
    return userBook;
  }

  async addBookToUser(insertUserBook: InsertUserBook): Promise<UserBookWithDetails> {
    const [userBook] = await db
      .insert(userBooks)
      .values(insertUserBook)
      .returning();
    
    const book = await this.getBook(userBook.bookId);
    if (!book) throw new Error("Book not found");
    
    return { ...userBook, book };
  }

  async updateUserBook(id: number, updates: Partial<UserBook>): Promise<UserBookWithDetails> {
    const [updatedUserBook] = await db
      .update(userBooks)
      .set({ 
        ...updates,
        dateUpdated: new Date()
      })
      .where(eq(userBooks.id, id))
      .returning();
    
    if (!updatedUserBook) {
      throw new Error("User book not found");
    }
    
    const book = await this.getBook(updatedUserBook.bookId);
    if (!book) throw new Error("Book not found");
    
    return { ...updatedUserBook, book };
  }

  async deleteUserBook(id: number): Promise<void> {
    await db.delete(userBooks).where(eq(userBooks.id, id));
  }

  async getPublicUserBooks(userId: number): Promise<UserBookWithDetails[]> {
    const result = await db.select({
      userBook: userBooks,
      book: books
    }).from(userBooks)
      .innerJoin(books, eq(userBooks.bookId, books.id))
      .where(
        and(
          eq(userBooks.userId, userId),
          eq(userBooks.isPublic, true)
        )
      );
    
    return result.map(row => ({
      ...row.userBook,
      book: row.book
    }));
  }

  // Community methods
  async followUser(followerId: number, followedId: number): Promise<void> {
    // Check if already following
    const existingFollow = await db.select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followedId, followedId)
        )
      );
    
    if (existingFollow.length === 0) {
      await db.insert(follows).values({
        followerId,
        followedId
      });
    }
  }

  async unfollowUser(followerId: number, followedId: number): Promise<void> {
    await db.delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followedId, followedId)
        )
      );
  }

  async isFollowing(followerId: number, followedId: number): Promise<boolean> {
    const follow = await db.select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followedId, followedId)
        )
      );
    
    return follow.length > 0;
  }

  async getFollowers(userId: number): Promise<User[]> {
    const result = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      bio: users.bio,
      profilePicture: users.profilePicture
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followedId, userId));
    
    return result;
  }

  async getFollowing(userId: number): Promise<User[]> {
    const result = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      bio: users.bio,
      profilePicture: users.profilePicture
    })
    .from(follows)
    .innerJoin(users, eq(follows.followedId, users.id))
    .where(eq(follows.followerId, userId));
    
    return result;
  }
}