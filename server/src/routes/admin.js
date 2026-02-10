import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const adminRouter = express.Router();

adminRouter.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password, role required" });
  }
  if (!['admin', 'reader'].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role
  });

  return res.status(201).json({
    user: { id: user._id.toString(), email: user.email, role: user.role }
  });
});
