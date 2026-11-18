// Claude Code statusLine command: saves the subscription usage windows for the Herdr
// `claude-usage` mod and prints nothing (Claude Code's own status line stays empty).
const fs = require("fs");
const path = require("path");
const os = require("os");

const OUT = path.join(os.homedir(), ".config", "herdr-app", "data", "claude-usage.json");

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const limits = JSON.parse(raw).rate_limits;
    if (!limits) return; // absent before the first API response, or on API-key sessions
    const pick = (w) => w && typeof w.used_percentage === "number"
      ? { used: w.used_percentage, resets_at: w.resets_at ?? null } : null;
    const data = { updated: Math.floor(Date.now() / 1000), five_hour: pick(limits.five_hour), seven_day: pick(limits.seven_day) };
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    const tmp = OUT + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(data));
    fs.renameSync(tmp, OUT);
  } catch {}
});
