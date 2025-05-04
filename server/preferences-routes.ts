import { Router } from "express";
import { preferencesStorage } from "./preferences-storage";

export const preferencesRouter = Router();

// Get user preferences
preferencesRouter.get("/", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  
  try {
    const preferences = await preferencesStorage.getUserPreferences(req.user.id);
    res.json(preferences);
  } catch (error) {
    console.error("Error getting preferences:", error);
    res.sendStatus(500);
  }
});

// Update user preferences
preferencesRouter.put("/", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  
  try {
    const preferences = await preferencesStorage.updateUserPreferences(req.user.id, req.body);
    res.json(preferences);
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.sendStatus(500);
  }
});

// Update reading time
preferencesRouter.post("/reading-time", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  
  const { additionalTime } = req.body;
  if (typeof additionalTime !== "number") {
    return res.status(400).json({ error: "Invalid reading time" });
  }
  
  try {
    await preferencesStorage.updateReadingTime(req.user.id, additionalTime);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error updating reading time:", error);
    res.sendStatus(500);
  }
});

// Add recently viewed book
preferencesRouter.post("/recently-viewed/:bookId", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  
  const bookId = parseInt(req.params.bookId);
  if (isNaN(bookId)) {
    return res.status(400).json({ error: "Invalid book ID" });
  }
  
  try {
    await preferencesStorage.addRecentlyViewedBook(req.user.id, bookId);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error adding recently viewed book:", error);
    res.sendStatus(500);
  }
}); 