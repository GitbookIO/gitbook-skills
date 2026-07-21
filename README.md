<p align="center">
  <img src="assets/gitbook_icon_dark.svg" alt="GitBook" width="48" />
</p>

<h1 align="center">GitBook Skills</h1>

<p align="center">A collection of skills for AI coding agents following the <a href="https://agentskills.io">Agent Skills</a> format. Available as a plugin for Claude Code, Cursor, OpenAI Codex, and Grok.</p>

## Install

```
npx skills add GitbookIO/gitbook-skills
```

Then select the ones you wish to install.

Running non-interactively (e.g. an AI agent installing on your behalf)? Use the `-y` flags to skip the interactive picker and install all skills — without them the installer hangs waiting for input:

```
npx -y skills add GitbookIO/gitbook-skills -y
```

## Available Skills

| Skill | Description |
|-------|-------------|
| [`write-docs`](/GitbookIO/gitbook-skills/blob/main/skills/write-docs) | Author and edit GitBook-flavored Markdown pages |
| [`configure-site`](/GitbookIO/gitbook-skills/blob/main/skills/configure-site) | Create and configure GitBook sites end-to-end via the REST API |
| [`write-openapi`](/GitbookIO/gitbook-skills/blob/main/skills/write-openapi) | Author and publish OpenAPI reference docs in GitBook |
| [`cr-create`](/GitbookIO/gitbook-skills/blob/main/skills/cr-create) | Drive a GitBook docs review flow via the REST API — create a change request, push content, request review, fix comments |
| [`cr-review`](/GitbookIO/gitbook-skills/blob/main/skills/cr-review) | Review GitBook change requests via the REST API — discover CRs, summarize changes, comment, approve or request changes |
| [`build-integration`](/GitbookIO/gitbook-skills/blob/main/skills/build-integration) | Build, develop, and publish GitBook integrations — custom blocks, ContentKit UI, events, OAuth |

## Example prompts

Once installed, just ask your agent in natural language. Here are a few things you can build:

<details>
<summary><strong>Spin up a new documentation site from scratch</strong></summary>

<br />

```
Create a new GitBook site for my product. Design the structure with a "Getting Started" section, a "Guides" section, and an "API Reference" section, scaffold the Git repo in monorepo layout, create the site and spaces via the API, and give me the Git Sync steps.
```

Uses [`configure-site`](/GitbookIO/gitbook-skills/blob/main/skills/configure-site) to design the structure, create the site/sections/spaces via the REST API, and hand off the one manual Git Sync step.

</details>

<details>
<summary><strong>Write and format your first pages</strong></summary>

<br />

```
Write a "Getting Started" page for my docs with a quickstart stepper, a hint block calling out the prerequisites, and tabs showing install commands for npm, yarn, and pnpm.
```

Uses [`write-docs`](/GitbookIO/gitbook-skills/blob/main/skills/write-docs) to author GitBook-flavored Markdown with blocks like steppers, hints, and tabs — no GitBook UI required.

</details>

<details>
<summary><strong>Add an interactive API reference</strong></summary>

<br />

```
Add an OpenAPI reference section to my site from this spec URL, wire up the interactive "Test it" runner, and add icons and code samples to the main operations.
```

Uses [`write-openapi`](/GitbookIO/gitbook-skills/blob/main/skills/write-openapi) to generate API reference pages, configure the "Test it" runner, and customize operations with GitBook `x-*` extensions.

</details>

## Plugins

This repo serves as a plugin for multiple platforms:

- **Claude Code** — `.claude-plugin/`
- **Cursor** — `.cursor-plugin/`
- **OpenAI Codex** — `.codex-plugin/`
- **Grok** — `.grok-plugin/`

## License

MIT
