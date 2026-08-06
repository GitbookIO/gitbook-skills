#!/usr/bin/env node
// Idempotently adds a top-level SUMMARY.md entry for skill.md so it
// publishes at the site root (gitbook.com/docs/skill -> .../skill.md).
// Run from inside a checkout of GitbookIO/public-docs.

const fs = require("fs");
const path = require("path");

const summaryPath = path.resolve(process.cwd(), "SUMMARY.md");
const content = fs.readFileSync(summaryPath, "utf8");

if (/\(skill\.md\)/.test(content)) {
  console.log("SUMMARY.md already references skill.md, leaving as-is");
  process.exit(0);
}

const lines = content.split("\n");
const entry = "* [Skill](skill.md)";
const overviewIdx = lines.findIndex((l) => /^\*\s*\[.*\]\(README\.md\)\s*$/.test(l));

if (overviewIdx === -1) {
  const tocIdx = lines.findIndex((l) => /^#\s*Table of contents/i.test(l));
  lines.splice(tocIdx === -1 ? 0 : tocIdx + 1, 0, "", entry);
} else {
  lines.splice(overviewIdx + 1, 0, entry);
}

fs.writeFileSync(summaryPath, lines.join("\n"));
console.log("Added skill.md entry to SUMMARY.md");
