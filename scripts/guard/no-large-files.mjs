import { execSync } from "node:child_process";
const MAX = 500 * 1024;
const ban = new Set([
  "mp4",
  "mov",
  "mkv",
  "avi",
  "zip",
  "7z",
  "rar",
  "psd",
  "ai",
  "sketch",
  "fig",
  "xd",
  "map",
]);
const out = execSync("git diff --cached --name-only", {
  encoding: "utf8",
}).trim();
if (!out) process.exit(0);
let bad = [];
for (const f of out.split("\n").filter(Boolean)) {
  try {
    const size = Number(
      execSync(`wc -c < "${f.replace(/"/g, '\\"')}"`, {
        encoding: "utf8",
      }).trim(),
    );
    const ext = f.toLowerCase().split(".").pop();
    if (size > MAX || ban.has(ext)) bad.push([f, size]);
  } catch {}
}
if (bad.length) {
  console.error("\n✖ Blocked large or banned files:\n");
  for (const [f, s] of bad)
    console.error(` - ${f} (${(s / 1024).toFixed(1)} kB)`);
  console.error("\nUse CDN/Storage or compress.");
  process.exit(1);
}
