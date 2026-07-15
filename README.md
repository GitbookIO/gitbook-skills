# GitBook Skills

A collection of skills for AI coding agents following the [Agent Skills](https://agentskills.io) format. Available as a plugin for Claude Code, Cursor, OpenAI Codex, and Grok.

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

## Plugins

This repo serves as a plugin for multiple platforms:

- **Claude Code** — `.claude-plugin/`
- **Cursor** — `.cursor-plugin/`
- **OpenAI Codex** — `.codex-plugin/`
- **Grok** — `.grok-plugin/`

## License

MIT
