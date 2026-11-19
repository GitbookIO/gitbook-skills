# Agent auth and discovery

Facts for agents working with GitBook without a browser. Verified against `@gitbook/cli` 0.33.4 (`packages/cli/src/cli.ts`, `config.ts`) and the live docs (gitbook.com/docs) in Nov 2026.

## Credentials

- **Personal access token (PAT).** Create one at https://app.gitbook.com/account/developer. It is the one credential that works everywhere: REST API (`Authorization: Bearer <token>` against `https://api.gitbook.com/v1`), the CLI, and the workspace MCP.
- **Never** write a token to a file, echo it back, or commit it. If the user must paste one, export it (`export GITBOOK_TOKEN=...`) and don't repeat it.

## CLI (`@gitbook/cli`)

| Command | Use it when |
| --- | --- |
| `gitbook auth --token <token>` | CI, SSH, containers, agent sandboxes, and any **integration publish/unpublish**. Omit `--token` to be prompted. |
| `gitbook login` | A person at a desktop. Opens a browser and waits for a callback on `127.0.0.1`, so it does **not** work over SSH, in containers, CI, or sandboxed agents. A browser (OAuth) session **cannot** publish or unpublish integrations. |
| `gitbook logout` | If you already used `login` and now need token auth (integration work), run `logout` first, then `auth --token`. |
| `gitbook whoami` | Confirm which identity the CLI is using. |

If the `GITBOOK_TOKEN` environment variable is set, the CLI uses it as a personal token (optional `GITBOOK_ENDPOINT` overrides the API endpoint).

## Workspace MCP (read/write)

- URL: `https://mcp.gitbook.com/mcp`. Streamable HTTP only (not stdio or SSE).
- Auth is either OAuth (the client handles sign-in; don't add a bearer header) or a PAT sent as `Authorization: Bearer <token>`.
- Claude Code with a PAT: `claude mcp add --transport http gitbook-mcp https://mcp.gitbook.com/mcp --header "Authorization: Bearer $GITBOOK_TOKEN"`.
- Codex with a PAT: set `bearer_token_env_var = "GITBOOK_MCP_TOKEN"` on the server entry in `~/.codex/config.toml`.
- It exposes a small set of curated tools (for example `list_sites`, `get_site_structure`, `get_page`, `create_change_request`, `submit_or_merge_change_request`, `get_usage_guide`) plus `search`, `describe_operation` and `invoke_operation`. Anything else in the REST API is reached by finding its operation id with `search`, inspecting it with `describe_operation`, and running it with `invoke_operation`. Operations can be public or irreversible (publishing a site, merging a change request), so confirm first.
- `get_usage_guide` with topic `onboarding` is a cheap read-only call to confirm the connection works.

## Published-docs MCP (read-only)

Every published GitBook site serves its own read-only MCP at `{site-url}/~gitbook/mcp` (for example `https://gitbook.com/docs/~gitbook/mcp`). It only exposes already-published content and is a different server from the workspace MCP.

## Discovery endpoints on published sites

- `{site-url}/llms.txt`: index of pages. `{site-url}/llms-full.txt`: the full corpus (expensive; prefer targeted pages).
- Append `.md` to any page URL for Markdown (for example `https://gitbook.com/docs/setup.md`), or send `Accept: text/markdown`.
- Ask a question about a page: `GET <page>.md?ask=<question>&goal=<what you are trying to achieve>`.
- `{site-url}/sitemap.md` lists valid page paths.
- Agent setup guide for people who want an agent to set up GitBook: https://gitbook.com/docs/setup.md.
