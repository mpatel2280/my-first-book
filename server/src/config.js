import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

const defaultBookRoot = path.resolve(process.cwd(), "..");

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/mdbook_auth",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  bookRoot: process.env.BOOK_ROOT || defaultBookRoot,
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  cookieName: process.env.AUTH_COOKIE_NAME || "mdbook_auth",
  cookieMaxAgeMs: Number(process.env.COOKIE_MAX_AGE_MS || 24 * 60 * 60 * 1000)
};
