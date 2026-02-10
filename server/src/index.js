import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import jwt from "jsonwebtoken";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { requireAuth, getToken, setAuthCookie } from "./middleware/auth.js";
import { ensureBookBuilt } from "./utils/mdbook.js";
import { User } from "./models/User.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

app.get("/book/auth", async (req, res) => {
  const token = getToken(req);
  if (token) {
    try {
      jwt.verify(token, config.jwtSecret);
      setAuthCookie(res, token);
      return res.redirect("/book/");
    } catch (error) {
      return res.status(401).send("Unauthorized");
    }
  }
  return res.status(401).send("Unauthorized");
});

app.use("/book", requireAuth, async (req, res, next) => {
  try {
    await ensureBookBuilt();
    return next();
  } catch (error) {
    console.error("mdbook build failed", error);
    return res.status(500).send("Failed to build book");
  }
});

const bookDir = path.join(config.bookRoot, "book");
app.use("/book", express.static(bookDir));

async function seedAdmin() {
  if (!config.adminEmail || !config.adminPassword) {
    return;
  }
  const existing = await User.findOne({ email: config.adminEmail.toLowerCase() });
  if (existing) {
    return;
  }
  const passwordHash = await bcrypt.hash(config.adminPassword, 10);
  await User.create({
    email: config.adminEmail.toLowerCase(),
    passwordHash,
    role: "admin"
  });
  console.log("Seeded admin user", config.adminEmail);
}

async function start() {
  await mongoose.connect(config.mongoUri);
  await seedAdmin();
  app.listen(config.port, () => {
    console.log(`Server listening on ${config.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
