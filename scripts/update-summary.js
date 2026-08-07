#!/usr/bin/env node
// Idempotently ensures SUMMARY.md has a top-level entry for skill.md plus
// nested entries for each generated skill/<name>.md page, so they publish
// at the site root (gitbook.com/docs/skill -> .../skill.md).
//
// Run from inside a checkout of GitbookIO/public-docs, with
// dist/skill-manifest.json copied alongside SUMMARY.md as
// ./skill-manifest.json.

const fs = require("fs");
const path = require("path");

const summaryPath = path.resolve(process.cwd(), "SUMMARY.md");
const manifestPath = path.resolve(process.cwd(), "skill-manifest.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const content = fs.readFileSync(summaryPath, "utf8");

if (/\(skill\.md\)/.test(content)) {
  console.log("SUMMARY.md already references skill.md, leaving as-is");
  process.exit(0);
}

const lines = content.split("\n");
const block = [
  "* [Skill](skill.md)",
  ...manifest.map((s) => `  * [${s.title}](skill/${s.dir}.md)`),
];

const overviewIdx = lines.findIndex((l) => /^\*\s*\[.*\]\(README\.md\)\s*$/.test(l));

if (overviewIdx === -1) {
  const tocIdx = lines.findIndex((l) => /^#\s*Table of contents/i.test(l));
  lines.splice(tocIdx === -1 ? 0 : tocIdx + 1, 0, "", ...block);
} else {
  lines.splice(overviewIdx + 1, 0, ...block);
}

fs.writeFileSync(summaryPath, lines.join("\n"));
console.log(`Added skill.md entry with ${manifest.length} nested pages to SUMMARY.md`);
