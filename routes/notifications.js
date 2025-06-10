import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get notifications for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        fromUser: true,
      },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark all as read
router.post("/mark-all-read", authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});

// Mark single notification as read
router.post("/:id/mark-read", authenticate, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

export default router;
