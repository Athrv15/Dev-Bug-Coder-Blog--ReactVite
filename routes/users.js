import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();

// Get current user's saved posts
router.get("/me/saved-posts", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const saved = await prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: true,
            comments: true,
          },
        },
      },
    });
    // Return just the posts
    res.json(saved.map((s) => s.post));
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ error: "Failed to fetch saved posts" });
  }
});

export default router;
