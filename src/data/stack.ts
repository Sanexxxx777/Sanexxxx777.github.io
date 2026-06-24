import type { StackGroup } from "./types";

export const stackGroups: StackGroup[] = [
  {
    head: { ru: "Backend / Python", en: "Backend / Python" },
    rows: [
      { name: "Python 3.11+", pct: 90, lvl: "core" },
      { name: "asyncio / aiohttp", pct: 85 },
      { name: "FastAPI", pct: 70 },
      { name: "pydantic / typing", pct: 75 },
      { name: "pytest", pct: 65 },
    ],
  },
  {
    head: { ru: "Automation / Scrape", en: "Automation / Scrape" },
    rows: [
      { name: "Playwright", pct: 88, lvl: "stealth" },
      { name: "Anti-bot evasion", pct: 80 },
      { name: "Telethon", pct: 82 },
      { name: "BeautifulSoup / lxml", pct: 85 },
    ],
  },
  {
    head: { ru: "LLM / AI", en: "LLM / AI" },
    rows: [
      { name: "Anthropic / Claude", pct: 88, lvl: "tool use" },
      { name: "Gemini API", pct: 80 },
      { name: "OpenAI / Codex", pct: 75 },
      { name: "Groq", pct: 72, lvl: "inference" },
      { name: "Prompt engineering", pct: 82 },
      { name: "Function calling / tools", pct: 78 },
    ],
  },
  {
    head: { ru: "Systems / Low-level", en: "Systems / Low-level" },
    rows: [
      { name: "Rust", pct: 55, lvl: "basics+" },
      { name: "WebSocket protocol", pct: 80 },
      { name: "On-chain signing / EVM", pct: 75 },
      { name: "Rate-limit / queue design", pct: 75 },
    ],
  },
  {
    head: { ru: "DevOps / Linux", en: "DevOps / Linux" },
    rows: [
      { name: "Linux CLI", pct: 85, lvl: "daily" },
      { name: "pm2 / systemd", pct: 82 },
      { name: "SSH / tunneling", pct: 80 },
      { name: "Docker", pct: 60 },
      { name: "git / GitHub", pct: 78 },
    ],
  },
  {
    head: { ru: "Web / Design", en: "Web / Design" },
    rows: [
      { name: "React / TypeScript", pct: 70 },
      { name: "HTML / CSS", pct: 78 },
      { name: "Node.js / Express", pct: 62 },
      { name: "D3.js", pct: 58 },
      { name: "Web & app design", pct: 72, lvl: "sites / apps" },
    ],
  },
];
