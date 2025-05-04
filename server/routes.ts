import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertBookSchema, insertUserBookSchema } from "@shared/schema";
import { preferencesRouter } from "./preferences-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Add preferences routes
  app.use("/api/preferences", preferencesRouter);

  // Books API
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  // User Books API (bookshelf)
  app.get("/api/user-books", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      const withReviews = req.query.withReviews === 'true';
      let books;
      if (userId && withReviews) {
        // Return all user_books for this user with non-null reviews
        books = await storage.getUserBooksWithReviews(userId);
      } else if (userId) {
        books = await storage.getUserBooks(userId);
      } else {
        return res.status(400).json({ message: "Missing userId parameter" });
      }
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user books" });
    }
  });

  app.post("/api/user-books", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const userBookData = insertUserBookSchema.parse({
        ...req.body,
        userId,
      });
      
      const userBook = await storage.addBookToUser(userBookData);
      res.status(201).json(userBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add book to user" });
    }
  });

  app.patch("/api/user-books/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userBookId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if this user book belongs to the current user
      const userBook = await storage.getUserBook(userBookId);
      if (!userBook || userBook.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this book" });
      }
      
      const updatedUserBook = await storage.updateUserBook(userBookId, req.body);
      res.json(updatedUserBook);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user book" });
    }
  });
  
  app.delete("/api/user-books/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userBookId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if this user book belongs to the current user
      const userBook = await storage.getUserBook(userBookId);
      if (!userBook || userBook.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this book" });
      }
      
      await storage.deleteUserBook(userBookId);
      res.status(200).json({ message: "Book successfully removed from shelf" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user book" });
    }
  });

  // User Community API
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getActiveUsers();
      // For each user, get their followers count
      const usersWithFollowers = await Promise.all(users.map(async (user) => {
        const followers = await storage.getFollowers(user.id);
        return {
          ...user,
          followersCount: followers.length,
        };
      }));
      res.json(usersWithFollowers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      
      // Users can only update their own profile
      if (req.user!.id !== userId) {
        return res.status(403).json({ message: "Not authorized to update this user" });
      }
      
      const { name, bio } = req.body;
      const updates: any = {};
      
      if (name !== undefined) updates.name = name;
      if (bio !== undefined) updates.bio = bio;
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get("/api/users/:id/books", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const publicUserBooks = await storage.getPublicUserBooks(userId);
      res.json(publicUserBooks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user books" });
    }
  });

  app.get("/api/users/:id/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log('GET /api/users/:id/profile userId =', userId);
      const user = await storage.getUser(userId);
      console.log('GET /api/users/:id/profile user =', user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password
      const { password, ...userWithoutPassword } = user;
      // Get public books
      const publicBooks = await storage.getPublicUserBooks(userId);
      // Get followers and following counts
      const followers = await storage.getFollowers(userId);
      const following = await storage.getFollowing(userId);
      res.json({
        user: userWithoutPassword,
        publicBooks,
        followersCount: followers.length,
        followingCount: following.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.post("/api/follow/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const followerId = req.user!.id;
      const followedId = parseInt(req.params.id);
      
      if (followerId === followedId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      await storage.followUser(followerId, followedId);
      res.status(201).json({ message: "User followed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/follow/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const followerId = req.user!.id;
      const followedId = parseInt(req.params.id);
      
      await storage.unfollowUser(followerId, followedId);
      res.status(200).json({ message: "User unfollowed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });
  
  app.get("/api/follow/status/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const followerId = req.user!.id;
      const followedId = parseInt(req.params.id);
      
      const isFollowing = await storage.isFollowing(followerId, followedId);
      res.json({ isFollowing });
    } catch (error) {
      res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  // Public Reviews API
  app.get("/api/reviews", async (req, res) => {
    try {
      // Get all user_books with a review (not just public)
      const result = await storage.getAllReviews();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
