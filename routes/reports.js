import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();
const prisma = new PrismaClient();

// User reports a post
router.post("/", authenticate, async (req, res) => {
  try {
    const { postId, reason } = req.body;
    const userId = req.userId;

    // Prevent duplicate reports by same user for same post
    const existing = await prisma.report.findFirst({
      where: { postId, userId, status: "pending" },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already reported this post." });
    }

    const report = await prisma.report.create({
      data: {
        postId,
        userId,
        reason: reason || null,
      },
    });
    res.status(201).json(report);
  } catch (error) {
    console.error("Error reporting post:", error);
    res.status(500).json({ error: "Failed to report post" });
  }
});

// Admin: get all reports
router.get("/", authenticate, async (req, res) => {
  try {
    // You can add admin check here if needed
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        post: { include: { author: true } },
        user: true,
      },
    });
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Admin: update report status
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.report.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ error: "Failed to update report" });
  }
});

export default router;
