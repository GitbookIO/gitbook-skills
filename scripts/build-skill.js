#!/usr/bin/env node
// Combines the six skills/*/SKILL.md files into one self-contained skill
// document, published at gitbook.com/docs/skill.md via public-docs.
//
// Deep reference material (skills/*/references/**) is intentionally left
// out — it's ~15x the size of the SKILL.md bodies combined and would bury
// the point of a single fetchable file. Point readers back to the repo
// instead.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const OUT_PATH = path.join(ROOT, "dist", "skill.md");
const REPO_URL = "https://github.com/GitbookIO/gitbook-skills";

// Order matches the README's "Available Skills" table.
const SKILLS = [
  { dir: "write-docs", title: "Write & Edit Docs" },
  { dir: "configure-site", title: "Configure a Site" },
  { dir: "write-openapi", title: "Write OpenAPI Reference Docs" },
  { dir: "cr-create", title: "Create & Manage Change Requests" },
  { dir: "cr-review", title: "Review Change Requests" },
  { dir: "build-integration", title: "Build an Integration" },
];

const UMBRELLA_DESCRIPTION =
  "Comprehensive skill for GitBook documentation and platform work: author and format GitBook-flavored " +
  "Markdown pages, README.md/SUMMARY.md, and blocks like hints, tabs, and steppers; design, scaffold, and " +
  "configure entire documentation sites end-to-end via the GitBook REST API and Git Sync; generate and " +
  "troubleshoot OpenAPI/Swagger API reference documentation; create, push content to, and manage GitBook " +
  "change requests over the REST API, including requesting and giving reviews; and build GitBook " +
  "integrations — custom blocks, ContentKit UI, events, and OAuth. Use this skill whenever a task involves " +
  "GitBook: writing or editing docs, restructuring or creating a site, working with .gitbook.yaml/SUMMARY.md, " +
  "OpenAPI references, change request review flows, or building an app/integration for GitBook.";

function parseTopLevelYaml(text) {
  const lines = text.split("\n");
  const result = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\S/.test(line)) continue; // only top-level (unindented) keys
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let rest = m[2].trim();
    if (rest === ">-" || rest === ">" || rest === "|-" || rest === "|") {
      const collected = [];
      let j = i + 1;
      while (j < lines.length && (lines[j] === "" || /^\s+/.test(lines[j]))) {
        if (lines[j].trim() !== "") collected.push(lines[j].trim());
        j++;
      }
      result[key] = collected.join(" ").trim();
      i = j - 1;
    } else {
      if (
        (rest.startsWith('"') && rest.endsWith('"')) ||
        (rest.startsWith("'") && rest.endsWith("'"))
      ) {
        rest = rest.slice(1, -1);
      }
      result[key] = rest;
    }
  }
  return result;
}

// Demotes headings by one level (so sections nest under our own H2), and
// drops each skill's own H1 title since we supply a section heading instead.
function processBody(body) {
  const lines = body.split("\n");
  let inFence = false;
  let sawContent = false;
  const out = [];

  for (const line of lines) {
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      out.push(line);
      sawContent = true;
      continue;
    }

    if (!inFence) {
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        if (!sawContent && h[1].length === 1) {
          sawContent = true;
          continue; // drop the doc's own top-level title
        }
        sawContent = true;
        const newLevel = Math.min(h[1].length + 1, 6);
        out.push("#".repeat(newLevel) + " " + h[2]);
        continue;
      }
    }

    if (line.trim() !== "") sawContent = true;
    out.push(line);
  }

  return out.join("\n").replace(/^\n+/, "").trim();
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function wrapFolded(text, indent = "  ", width = 100) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > width) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.map((l) => indent + l).join("\n");
}

function parseSkillFile(dir) {
  const filePath = path.join(SKILLS_DIR, dir, "SKILL.md");
  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`No frontmatter found in ${filePath}`);
  const frontmatter = parseTopLevelYaml(match[1]);
  return {
    name: frontmatter.name || dir,
    description: frontmatter.description || "",
    body: processBody(match[2]),
  };
}

function main() {
  const parsed = SKILLS.map((s) => ({ ...s, ...parseSkillFile(s.dir) }));

  const toc = parsed
    .map((s) => `- [${s.title}](#${slugify(s.title)})`)
    .join("\n");

  const sections = parsed
    .map((s) => `## ${s.title}\n\n> ${s.description}\n\n${s.body}`)
    .join("\n\n---\n\n");

  const out = `---
name: gitbook
description: >-
${wrapFolded(UMBRELLA_DESCRIPTION)}
---

{% hint style="info" %}
This page is generated automatically from [GitbookIO/gitbook-skills](${REPO_URL}). Don't edit it directly — edit the source skills there instead.
{% endhint %}

# GitBook

This is GitBook's complete skill for working with GitBook as an AI coding agent, combining the six skills from [gitbook-skills](${REPO_URL}) into one document. Jump to the section that matches your task. Each skill also has deeper reference material (full block syntax, API payloads, troubleshooting guides) in the [gitbook-skills repo](${REPO_URL}) under \`skills/<name>/references/\` if you need more than what's here.

## Contents

${toc}

---

${sections}
`;

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, out);
  console.log(`Wrote ${OUT_PATH} (${out.length} bytes)`);
}

main();
