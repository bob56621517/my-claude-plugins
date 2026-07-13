const allowedDirs = (process.env.FILESYSTEM_ALLOWED_DIR ?? '')
  .split(/[:;]/)
  .map((s) => s.trim())
  .filter(Boolean);

import { spawn } from "child_process";

const child = spawn(
  "bunx",
  ["@modelcontextprotocol/server-filesystem", ...allowedDirs],
  { stdio: "inherit" },
);

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
