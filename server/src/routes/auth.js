import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { config } from "../config.js";
import { requireAuth, setAuthCookie } from "../middleware/auth.js";

export const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return res.json({
    token,
    user: { id: user._id.toString(), email: user.email, role: user.role }
  });
});

authRouter.post("/session", async (req, res) => {
  const { token } = req.body || {};
  if (!token) {
    return res.status(400).json({ error: "Token required" });
  }
  setAuthCookie(res, token);
  return res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});
