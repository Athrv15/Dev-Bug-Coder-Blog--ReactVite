import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/authenticate.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = express.Router();
const prisma = new PrismaClient();

// Set up multer for avatar upload
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

// Token validation route
router.get("/validate", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(401).json({ valid: false, error: "User not found" });
    }
    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ valid: false, error: "Server error" });
  }
});

// Register route - POST /register
router.post("/register", upload.single("avatar"), async (req, res) => {
  try {
    const { name, email, password, country } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, country, avatarUrl },
    });
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login route - POST /login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Update profile route - PUT /me
router.put("/me", authenticate, upload.single("avatar"), async (req, res) => {
  try {
    const { name, email, country, password } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (country) updateData.country = country;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    if (req.file) {
      updateData.avatarUrl = `/uploads/${req.file.filename}`;
    }
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
    });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      country: user.country,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Profile update failed" });
  }
});

// Forgot password - send reset email (secure)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond with success to prevent user enumeration
    if (!user) {
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }
    // Generate secure token and expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });
    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const resetUrl = `${
      process.env.FRONTEND_URL
    }/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. <a href="${resetUrl}">Click here to reset your password</a>. This link will expire in 15 minutes.</p>`,
    });
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    res.status(500).json({ error: "Failed to process request." });
  }
});

// Reset password (secure)
router.post("/reset-password", async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      user.resetToken !== resetToken ||
      !user.resetTokenExpiry ||
      new Date() > user.resetTokenExpiry
    ) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    res.json({ message: "Password has been reset." });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password." });
  }
});

export default router;
