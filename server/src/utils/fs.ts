import { mkdir, writeFile, stat } from "fs/promises";
import { dirname, join, normalize, resolve } from "path";

export async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120) || "anyspecs";
}

export function safeJoinCwd(relativePath: string): string {
  const cwd = process.cwd();
  const abs = resolve(cwd, relativePath);
  const normCwd = normalize(cwd + "/");
  const normAbs = normalize(abs);
  if (!normAbs.startsWith(normCwd)) {
    throw new Error("Path traversal detected; write aborted");
  }
  return abs;
}

export async function writeFileSafe(path: string, content: string) {
  await ensureDir(dirname(path));
  await writeFile(path, content, "utf8");
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export function timestampName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  return `anyspecs-${iso}`;
}

