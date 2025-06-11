import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { PrismaClient } from "@prisma/client";
import path from "path";
const router = express.Router();
const prisma = new PrismaClient();

// Serve uploaded images from backend
const uploadsPath = path.resolve("uploads");
router.use("/uploads", express.static(uploadsPath));

// Get current user's saved posts
router.get("/me/saved-posts", authenticate, async (req, res) => {
  // If not authenticated, return 200 with empty array (fix for frontend unauthenticated requests)
  if (!req.userId) {
    return res.status(200).json([]);
  }
  try {
    const saved = await prisma.savedPost.findMany({
      where: { userId: req.userId },
      include: {
        post: {
          include: {
            author: true,
            comments: true,
          },
        },
      },
    });
    res.json(saved.map((s) => s.post));
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ error: "Failed to fetch saved posts" });
  }
});

export default router;
