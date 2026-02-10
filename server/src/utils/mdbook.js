import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

const execFileAsync = promisify(execFile);
let lastBuildAt = 0;

async function getLatestMtime(targetPath) {
  const stats = await fs.stat(targetPath);
  if (stats.isFile()) {
    return stats.mtimeMs;
  }
  if (stats.isDirectory()) {
    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    const mtimes = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(targetPath, entry.name);
        return getLatestMtime(fullPath);
      })
    );
    return Math.max(stats.mtimeMs, ...mtimes);
  }
  return stats.mtimeMs;
}

export async function ensureBookBuilt() {
  const srcDir = path.join(config.bookRoot, "src");
  const bookToml = path.join(config.bookRoot, "book.toml");
  const outputIndex = path.join(config.bookRoot, "book", "index.html");
  let outputExists = true;
  try {
    await fs.stat(outputIndex);
  } catch {
    outputExists = false;
  }
  const latestSourceMtime = Math.max(
    await getLatestMtime(srcDir),
    await getLatestMtime(bookToml)
  );

  if (outputExists && latestSourceMtime <= lastBuildAt) {
    return;
  }

  await execFileAsync("mdbook", ["build", config.bookRoot], {
    cwd: config.bookRoot
  });
  lastBuildAt = Date.now();
}
