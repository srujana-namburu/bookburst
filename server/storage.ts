import {
  users,
  books,
  userBooks,
  follows,
  type User,
  type InsertUser,
  type Book,
  type InsertBook,
  type UserBook,
  type InsertUserBook,
  type UserBookWithDetails
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
  getPublicUserBooks(userId: number): Promise<UserBookWithDetails[]>;

  // Community methods
  followUser(followerId: number, followedId: number): Promise<void>;
  unfollowUser(followerId: number, followedId: number): Promise<void>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private userBooks: Map<number, UserBook>;
  private follows: Map<number, { followerId: number, followedId: number }>;
  currentUserId: number;
  currentBookId: number;
  currentUserBookId: number;
  currentFollowId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.userBooks = new Map();
    this.follows = new Map();
    this.currentUserId = 1;
    this.currentBookId = 1;
    this.currentUserBookId = 1;
    this.currentFollowId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    // Seed some initial data
    this.seedData();
  }

  private seedData() {
    // Seed some books
    const initialBooks = [
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Fiction",
        publicationDate: "2020-08-13",
        isbn: "9781786892737"
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        coverImage: "https://images.unsplash.com/photo-1531911120215-9f628dc6e9c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Self-help",
        publicationDate: "2018-10-16",
        isbn: "9781847941831"
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Science Fiction",
        publicationDate: "1965-08-01",
        isbn: "9780441172719"
      },
      {
        title: "The Invisible Life of Addie LaRue",
        author: "V.E. Schwab",
        coverImage: "https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Fantasy",
        publicationDate: "2020-10-06",
        isbn: "9780765387561"
      },
      {
        title: "The Song of Achilles",
        author: "Madeline Miller",
        coverImage: "https://images.unsplash.com/photo-1511108690759-009324a90311?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Historical Fiction",
        publicationDate: "2011-09-20",
        isbn: "9780062060617"
      },
      {
        title: "Project Hail Mary",
        author: "Andy Weir",
        coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Science Fiction",
        publicationDate: "2021-05-04",
        isbn: "9780593135204"
      },
      {
        title: "Klara and the Sun",
        author: "Kazuo Ishiguro",
        coverImage: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Science Fiction",
        publicationDate: "2021-03-02",
        isbn: "9780571364879"
      },
      {
        title: "The Four Winds",
        author: "Kristin Hannah",
        coverImage: "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Historical Fiction",
        publicationDate: "2021-02-02",
        isbn: "9781250178602"
      }
    ];

    initialBooks.forEach(book => {
      const id = this.currentBookId++;
      this.books.set(id, { id, ...book });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getActiveUsers(): Promise<User[]> {
    // In a real app, we would filter for active users
    return Array.from(this.users.values()).map(user => {
      // Remove password for security
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.currentBookId++;
    const book: Book = { ...insertBook, id };
    this.books.set(id, book);
    return book;
  }

  async getUserBooks(userId: number): Promise<UserBookWithDetails[]> {
    const userBooksArray = Array.from(this.userBooks.values())
      .filter(userBook => userBook.userId === userId);
    
    return Promise.all(userBooksArray.map(async userBook => {
      const book = await this.getBook(userBook.bookId);
      return { ...userBook, book: book! };
    }));
  }

  async getUserBook(id: number): Promise<UserBook | undefined> {
    return this.userBooks.get(id);
  }

  async addBookToUser(insertUserBook: InsertUserBook): Promise<UserBookWithDetails> {
    const id = this.currentUserBookId++;
    const dateAdded = new Date();
    const dateUpdated = new Date();
    
    const userBook: UserBook = { 
      ...insertUserBook, 
      id, 
      dateAdded, 
      dateUpdated 
    };
    
    this.userBooks.set(id, userBook);
    
    const book = await this.getBook(userBook.bookId);
    return { ...userBook, book: book! };
  }

  async updateUserBook(id: number, updates: Partial<UserBook>): Promise<UserBookWithDetails> {
    const userBook = this.userBooks.get(id);
    if (!userBook) {
      throw new Error("User book not found");
    }
    
    const updatedUserBook: UserBook = { 
      ...userBook, 
      ...updates,
      dateUpdated: new Date()
    };
    
    this.userBooks.set(id, updatedUserBook);
    
    const book = await this.getBook(updatedUserBook.bookId);
    return { ...updatedUserBook, book: book! };
  }

  async getPublicUserBooks(userId: number): Promise<UserBookWithDetails[]> {
    const userBooksArray = Array.from(this.userBooks.values())
      .filter(userBook => userBook.userId === userId && userBook.isPublic);
    
    return Promise.all(userBooksArray.map(async userBook => {
      const book = await this.getBook(userBook.bookId);
      return { ...userBook, book: book! };
    }));
  }

  async followUser(followerId: number, followedId: number): Promise<void> {
    // Check if already following
    const isFollowing = Array.from(this.follows.values())
      .some(f => f.followerId === followerId && f.followedId === followedId);
    
    if (isFollowing) {
      return; // Already following
    }
    
    const id = this.currentFollowId++;
    this.follows.set(id, { followerId, followedId });
  }

  async unfollowUser(followerId: number, followedId: number): Promise<void> {
    const followEntryId = Array.from(this.follows.entries())
      .find(([_, f]) => f.followerId === followerId && f.followedId === followedId)?.[0];
    
    if (followEntryId) {
      this.follows.delete(followEntryId);
    }
  }
}

export const storage = new MemStorage();
