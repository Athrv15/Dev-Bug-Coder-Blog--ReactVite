import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { authenticate } from "../middleware/authenticate.js";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// Set up multer to save files to /uploads
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Helper to get userId from token if present
function getUserIdFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

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

// GET all posts - GET /
router.get("/", async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (userId) {
      const postsWithUserState = await Promise.all(
        posts.map(async (post) => {
          const liked = await prisma.postLike.findUnique({
            where: { userId_postId: { userId, postId: post.id } },
          });
          const helpful = await prisma.postHelpful.findUnique({
            where: { userId_postId: { userId, postId: post.id } },
          });
          const likes = await prisma.postLike.count({
            where: { postId: post.id },
          });
          const helpfulCount = await prisma.postHelpful.count({
            where: { postId: post.id },
          });
          return {
            ...post,
            liked: !!liked,
            helpful: !!helpful,
            likes,
            helpfulCount,
          };
        })
      );
      return res.json(postsWithUserState);
    } else {
      const postsWithCounts = await Promise.all(
        posts.map(async (post) => {
          const likes = await prisma.postLike.count({
            where: { postId: post.id },
          });
          const helpfulCount = await prisma.postHelpful.count({
            where: { postId: post.id },
          });
          return {
            ...post,
            liked: false,
            helpful: false,
            likes,
            helpfulCount,
          };
        })
      );
      return res.json(postsWithCounts);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET single post - GET /:id
router.get("/:id([a-zA-Z0-9-_]+)", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        comments: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    let liked = false;
    let helpful = false;
    if (userId) {
      const likedObj = await prisma.postLike.findUnique({
        where: { userId_postId: { userId, postId: id } },
      });
      const helpfulObj = await prisma.postHelpful.findUnique({
        where: { userId_postId: { userId, postId: id } },
      });
      liked = !!likedObj;
      helpful = !!helpfulObj;
    }

    const likes = await prisma.postLike.count({ where: { postId: id } });
    const helpfulCount = await prisma.postHelpful.count({
      where: { postId: id },
    });

    res.json({
      ...post,
      liked,
      helpful,
      likes,
      helpfulCount,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Create new post - POST /
router.post(
  "/",
  authenticate,
  upload.fields([{ name: "screenshot", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { headline, errorDescription, solution, codeSnippet } = req.body;
      if (!headline || !solution) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const screenshot = req.files?.screenshot?.[0] || null;
      const imageUrl = screenshot ? `/uploads/${screenshot.filename}` : null;
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

      const newPost = await prisma.post.create({
        data: {
          title: headline,
          description: errorDescription || "",
          content: solution,
          codeSnippet: codeSnippet || "",
          createdAt: new Date(),
          tags,
          imageUrl,
          likes: 0,
          helpfulCount: 0,
          author: { connect: { id: req.userId } },
        },
      });

      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  }
);

// Toggle like - POST /:id/like
router.post("/:id([a-zA-Z0-9-_]+)/like", authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const existing = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.postLike.delete({
        where: { userId_postId: { userId, postId } },
      });
    } else {
      await prisma.postLike.create({
        data: { userId, postId },
      });
    }

    const likes = await prisma.postLike.count({
      where: { postId: postId },
    });

    // Notify post author if not self
    if (post.authorId !== userId) {
      await createNotification({
        userId: post.authorId,
        type: "like",
        postId,
        fromUserId: userId,
        message: `Your post was liked.`,
      });
    }

    res.json({ liked: !existing, likes });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// Toggle helpful - POST /:id/helpful
router.post("/:id([a-zA-Z0-9-_]+)/helpful", authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const existing = await prisma.postHelpful.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.postHelpful.delete({
        where: { userId_postId: { userId, postId } },
      });
    } else {
      await prisma.postHelpful.create({
        data: { userId, postId },
      });
    }

    const helpfulCount = await prisma.postHelpful.count({
      where: { postId },
    });

    // Notify post author if not self
    if (post.authorId !== userId) {
      await createNotification({
        userId: post.authorId,
        type: "helpful",
        postId,
        fromUserId: userId,
        message: `Your post was marked helpful.`,
      });
    }

    res.json({ helpful: !existing, helpfulCount });
  } catch (error) {
    console.error("Error toggling helpful:", error);
    res.status(500).json({ error: "Failed to toggle helpful" });
  }
});

// Save a post
router.post("/:id/save", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    // Check if already saved
    const existing = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId: id } },
    });
    if (existing) {
      return res.status(200).json({ saved: true });
    }
    await prisma.savedPost.create({
      data: {
        user: { connect: { id: userId } },
        post: { connect: { id } },
      },
    });
    res.json({ saved: true });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ error: "Failed to save post" });
  }
});

// Unsave a post
router.post("/:id/unsave", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    await prisma.savedPost.deleteMany({
      where: { userId, postId: id },
    });
    res.json({ saved: false });
  } catch (error) {
    console.error("Error unsaving post:", error);
    res.status(500).json({ error: "Failed to unsave post" });
  }
});

// Report a post (simple log, you can expand as needed)
router.post("/:id/report", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    res.json({ reported: true });
  } catch (error) {
    console.error("Error reporting post:", error);
    res.status(500).json({ error: "Failed to report post" });
  }
});

// Add comment to a post - POST /post/:postId
router.post("/post/:postId/comment", authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = await prisma.comment.create({
      data: {
        post: { connect: { id: postId } },
        author: { connect: { id: userId } },
        content,
        createdAt: new Date(),
      },
    });

    // Notify post author if not self
    await createNotification({
      userId: post.authorId,
      type: "comment",
      postId,
      commentId: comment.id,
      fromUserId: userId,
      message: `Someone commented on your post.`,
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Edit a post
router.put(
  "/:id",
  authenticate,
  upload.fields([{ name: "screenshot", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, content, codeSnippet, imageUrl } = req.body;
      // Only allow the author to edit
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) return res.status(404).json({ error: "Post not found" });
      if (post.authorId !== req.userId)
        return res.status(403).json({ error: "Not authorized" });

      let updatedImageUrl = imageUrl;
      if (req.files && req.files.screenshot && req.files.screenshot[0]) {
        updatedImageUrl = `/uploads/${req.files.screenshot[0].filename}`;
      }
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

      const updated = await prisma.post.update({
        where: { id },
        data: {
          title,
          description,
          content,
          codeSnippet,
          tags,
          imageUrl: updatedImageUrl,
        },
      });
      res.json(updated);
    } catch (error) {
      console.error("Error editing post:", error);
      res.status(500).json({ error: "Failed to edit post" });
    }
  }
);

// Delete a post
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    // Delete all related records first
    await prisma.savedPost.deleteMany({ where: { postId: id } });
    await prisma.postLike.deleteMany({ where: { postId: id } });
    await prisma.postHelpful.deleteMany({ where: { postId: id } });
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.report.deleteMany({ where: { postId: id } });

    // Now delete the post
    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
