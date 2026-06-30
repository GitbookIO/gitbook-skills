# GitBook Skills

A collection of skills for AI coding agents following the [Agent Skills](https://agentskills.io) format. Available as a plugin for Claude Code, Cursor, OpenAI Codex, and Grok.

## Install

```
npx skills add GitbookIO/gitbook-skills
```

Then select the ones you wish to install.

## Available Skills

| Skill | Description |
|-------|-------------|
| [`write-docs`](/GitbookIO/gitbook-skills/blob/main/skills/write-docs) | Author and edit GitBook-flavored Markdown pages |
| [`configure-site`](/GitbookIO/gitbook-skills/blob/main/skills/configure-site) | Create and configure GitBook sites end-to-end via the REST API |
| [`write-openapi`](/GitbookIO/gitbook-skills/blob/main/skills/write-openapi) | Author and publish OpenAPI reference docs in GitBook |

## Plugins

This repo serves as a plugin for multiple platforms:

- **Claude Code** — `.claude-plugin/`
- **Cursor** — `.cursor-plugin/`
- **OpenAI Codex** — `.codex-plugin/`
- **Grok** — `.grok-plugin/`

## License

MIT
