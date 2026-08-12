#!/usr/bin/env node
// Idempotently ensures documentation/SUMMARY.md has a trailing entry for
// skill/README.md plus nested entries for each generated skill/<name>.md
// page. Appended after a "***" divider at the end of the file, matching
// the existing hand-set structure there.
//
// Run from inside the documentation/ folder of a checkout of
// GitbookIO/public-docs, with dist/skill-manifest.json copied alongside
// SUMMARY.md as ./skill-manifest.json.

const fs = require("fs");
const path = require("path");

const summaryPath = path.resolve(process.cwd(), "SUMMARY.md");
const manifestPath = path.resolve(process.cwd(), "skill-manifest.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const content = fs.readFileSync(summaryPath, "utf8");

if (/\(skill\/README\.md\)/.test(content)) {
  console.log("SUMMARY.md already references skill/README.md, leaving as-is");
  process.exit(0);
}

const block = [
  "* [Skill](skill/README.md)",
  ...manifest.map((s) => `  * [${s.title}](skill/${s.dir}.md)`),
];

const trimmed = content.replace(/\s+$/, "");
const newContent = `${trimmed}\n\n***\n\n${block.join("\n")}\n`;

fs.writeFileSync(summaryPath, newContent);
console.log(`Added skill/README.md entry with ${manifest.length} nested pages to SUMMARY.md`);
