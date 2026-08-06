#!/usr/bin/env node
// Builds a single, spec-compliant `gitbook` skill from the six
// skills/*/SKILL.md files, published at gitbook.com/docs/skill.md via
// public-docs.
//
// Per the Agent Skills spec (https://agentskills.io/specification):
//   - frontmatter `description` must be <= 1024 characters
//   - SKILL.md should stay under ~500 lines / ~5000 tokens; detailed
//     instructions belong in files loaded on demand, not inlined
//
// So this does NOT inline the six skill bodies. It's a short router: each
// skill's own frontmatter description (already written for keyword-based
// routing) plus a link to its full SKILL.md on GitHub, which an agent
// fetches only once it's decided that skill is relevant.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const OUT_PATH = path.join(ROOT, "dist", "skill.md");
const REPO_URL = "https://github.com/GitbookIO/gitbook-skills";
const MAX_DESCRIPTION_LENGTH = 1024;
const RECOMMENDED_MAX_LINES = 500;

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
  "Work with GitBook end-to-end: author and format GitBook-flavored Markdown pages and blocks " +
  "(hints, tabs, steppers); design, scaffold, and configure documentation sites via the GitBook " +
  "REST API and Git Sync; generate and troubleshoot OpenAPI/Swagger API reference docs; create, " +
  "push content to, and manage change requests and reviews over the REST API; and build GitBook " +
  "integrations (custom blocks, ContentKit UI, events, OAuth). Use whenever a task involves " +
  "GitBook: writing or editing docs, SUMMARY.md/.gitbook.yaml, site structure, OpenAPI " +
  "references, change-request review flows, or building a GitBook app/integration.";

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
  };
}

function main() {
  if (UMBRELLA_DESCRIPTION.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(
      `Combined description is ${UMBRELLA_DESCRIPTION.length} chars, over the ${MAX_DESCRIPTION_LENGTH}-char spec limit`
    );
  }

  const parsed = SKILLS.map((s) => ({ ...s, ...parseSkillFile(s.dir) }));

  const entries = parsed
    .map((s) => {
      const skillUrl = `${REPO_URL}/blob/main/skills/${s.dir}/SKILL.md`;
      return `### ${s.title}\n\n${s.description}\n\nFull instructions: [skills/${s.dir}/SKILL.md](${skillUrl})`;
    })
    .join("\n\n");

  const out = `---
name: gitbook
description: >-
${wrapFolded(UMBRELLA_DESCRIPTION)}
---

{% hint style="info" %}
This page is generated automatically from [GitbookIO/gitbook-skills](${REPO_URL}). Don't edit it directly — edit the source skills there instead.
{% endhint %}

# GitBook

GitBook's skill for AI coding agents, covering six areas of GitBook work. Each section below is one of the six skills in [gitbook-skills](${REPO_URL}) — read its description to see if it matches your task, then fetch its linked \`SKILL.md\` for full instructions before acting. Each skill's \`SKILL.md\` links out to further reference material (full block syntax, API payloads, troubleshooting) under \`skills/<name>/references/\` when you need more depth than the top-level instructions.

${entries}
`;

  const lineCount = out.split("\n").length;
  if (lineCount > RECOMMENDED_MAX_LINES) {
    console.warn(
      `Warning: generated skill.md is ${lineCount} lines, over the spec's recommended ${RECOMMENDED_MAX_LINES}-line ceiling`
    );
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, out);
  console.log(`Wrote ${OUT_PATH} (${out.length} bytes, ${lineCount} lines)`);
}

main();
