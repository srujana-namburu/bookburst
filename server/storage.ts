import { users, books, userBooks, follows } from "@shared/schema";
import { InsertUser, User, InsertBook, Book, InsertUserBook, UserBook, UserBookWithDetails } from "@shared/schema";
import session from "express-session";
import { DatabaseStorage } from "./database-storage";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  getActiveUsers(): Promise<User[]>;

  // Book methods
  getAllBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;

  // User Book methods
  getUserBooks(userId: number): Promise<UserBookWithDetails[]>;
  getUserBook(id: number): Promise<UserBook | undefined>;
  addBookToUser(userBook: InsertUserBook): Promise<UserBookWithDetails>;
  updateUserBook(id: number, updates: Partial<UserBook>): Promise<UserBookWithDetails>;
  deleteUserBook(id: number): Promise<void>;
  getPublicUserBooks(userId: number): Promise<UserBookWithDetails[]>;

  // Community methods
  followUser(followerId: number, followedId: number): Promise<void>;
  unfollowUser(followerId: number, followedId: number): Promise<void>;
  isFollowing(followerId: number, followedId: number): Promise<boolean>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  
  sessionStore: session.Store;
}

export const storage = new DatabaseStorage();