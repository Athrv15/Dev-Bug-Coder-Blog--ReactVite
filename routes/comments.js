import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { authenticate } from "../middleware/authenticate.js";
import path from "path";
import fs from "fs";

const router = express.Router();
const prisma = new PrismaClient();

// Set up multer for image uploads
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Helper to create notification
async function createNotification({
  userId,
  type,
  postId,
  commentId,
  fromUserId,
  message,
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        postId,
        commentId,
        fromUserId,
        message,
      },
    });
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}

// Get comments for a post - GET /post/:postId
router.get("/post/:postId([a-zA-Z0-9-_]+)", async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId; // Will be undefined for non-authenticated requests

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: true,
        commentLikes: true,
        commentHelpfuls: true,
      },
      orderBy: [
        { parentId: "asc" }, // Order by parentId first to group replies
        { createdAt: "asc" }, // Then by creation time
      ],
    });

    // Transform comments to include user-specific like/helpful status
    const transformedComments = comments.map((comment) => ({
      ...comment,
      liked: userId
        ? comment.commentLikes.some((like) => like.userId === userId)
        : false,
      helpful: userId
        ? comment.commentHelpfuls.some((helpful) => helpful.userId === userId)
        : false,
      likeCount: comment.commentLikes.length,
      helpfulCount: comment.commentHelpfuls.length,
      commentLikes: undefined,
      commentHelpfuls: undefined,
    }));

    res.json(transformedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Add comment to a post - POST /post/:postId
router.post(
  "/post/:postId([a-zA-Z0-9-_]+)",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    try {
      const { postId } = req.params;
      const { content, parentId } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      let imageUrl = null;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const newComment = await prisma.comment.create({
        data: {
          content,
          createdAt: new Date(),
          avatarUrl: req.userAvatarUrl || null,
          imageUrl,
          post: { connect: { id: postId } },
          author: { connect: { id: req.userId } },
          parentId: parentId || null, // Explicitly handle parentId
        },
        include: {
          author: true,
        },
      });

      // Notify post author if not self
      const post = await prisma.post.findUnique({
        where: { id: req.params.postId },
      });
      if (post && post.authorId !== req.userId) {
        await createNotification({
          userId: post.authorId,
          type: "comment",
          postId: post.id,
          commentId: newComment.id,
          fromUserId: req.userId,
          message: `Someone commented on your post.`,
        });
      }

      res.status(201).json({
        ...newComment,
        liked: false,
        helpful: false,
        likeCount: 0,
        helpfulCount: 0,
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Failed to add comment" });
    }
  }
);

// Toggle like for a comment - POST /:id/like
router.post("/:id([a-zA-Z0-9-_]+)/like", authenticate, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.userId;
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true, post: true },
    });
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existing) {
      await prisma.commentLike.delete({
        where: { userId_commentId: { userId, commentId } },
      });
    } else {
      await prisma.commentLike.create({
        data: { userId, commentId },
      });
    }

    const likeCount = await prisma.commentLike.count({
      where: { commentId },
    });

    // Notify comment author if not self
    if (comment.authorId !== userId) {
      await createNotification({
        userId: comment.authorId,
        type: "comment_like",
        postId: comment.postId,
        commentId,
        fromUserId: userId,
        message: `Someone liked your comment.`,
      });
    }

    res.json({ liked: !existing, likeCount });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// Toggle helpful for a comment - POST /:id/helpful
router.post("/:id([a-zA-Z0-9-_]+)/helpful", authenticate, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.userId;

    const existing = await prisma.commentHelpful.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existing) {
      await prisma.commentHelpful.delete({
        where: { userId_commentId: { userId, commentId } },
      });
    } else {
      await prisma.commentHelpful.create({
        data: { userId, commentId },
      });
    }

    const helpfulCount = await prisma.commentHelpful.count({
      where: { commentId },
    });

    // Notify comment author if not self
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (comment && comment.authorId !== userId) {
      await createNotification({
        userId: comment.authorId,
        type: "comment_helpful",
        postId: comment.postId,
        commentId,
        fromUserId: userId,
        message: `Someone marked your comment as helpful.`,
      });
    }

    res.json({ helpful: !existing, helpfulCount });
  } catch (error) {
    console.error("Error toggling comment helpful:", error);
    res.status(500).json({ error: "Failed to toggle helpful" });
  }
});

// Edit a comment - PUT /:id
router.put("/:id([a-zA-Z0-9-_]+)", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    // Check if user owns the comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author.id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this comment" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: true,
        commentLikes: true,
        commentHelpfuls: true,
      },
    });

    res.json({
      ...updatedComment,
      liked: updatedComment.commentLikes.some((like) => like.userId === userId),
      helpful: updatedComment.commentHelpfuls.some(
        (helpful) => helpful.userId === userId
      ),
      likeCount: updatedComment.commentLikes.length,
      helpfulCount: updatedComment.commentHelpfuls.length,
      commentLikes: undefined,
      commentHelpfuls: undefined,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// Delete a comment - DELETE /:id
router.delete("/:id([a-zA-Z0-9-_]+)", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if user owns the comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author.id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
