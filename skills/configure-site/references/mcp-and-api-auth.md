# API and MCP auth for agents

How agents authenticate to the GitBook REST API and MCP servers without a browser. Verified against the live docs (gitbook.com/docs) and the workspace MCP in Nov 2026.

## Credentials

- **Personal access token (PAT).** Create one at https://app.gitbook.com/account/developer. It is the one credential that works everywhere: REST API (`Authorization: Bearer <token>` against `https://api.gitbook.com/v1`), the CLI, and the workspace MCP.
- **Never** write a token to a file, echo it back, or commit it. If the user must paste one, export it (`export GITBOOK_TOKEN=...`) and don't repeat it.

## Workspace MCP (read/write)

- URL: `https://mcp.gitbook.com/mcp`. Streamable HTTP only (not stdio or SSE).
- Auth is either OAuth (the client handles sign-in; don't add a bearer header) or a PAT sent as `Authorization: Bearer <token>`.
- Claude Code with a PAT: `claude mcp add --transport http gitbook-mcp https://mcp.gitbook.com/mcp --header "Authorization: Bearer $GITBOOK_TOKEN"`.
- Codex with a PAT: set `bearer_token_env_var = "GITBOOK_MCP_TOKEN"` on the server entry in `~/.codex/config.toml`.
- It exposes a small set of curated tools (for example `list_sites`, `get_site_structure`, `get_page`, `create_change_request`, `submit_or_merge_change_request`, `get_usage_guide`) plus `search`, `describe_operation` and `invoke_operation`. Anything else in the REST API is reached by finding its operation id with `search`, inspecting it with `describe_operation`, and running it with `invoke_operation`. Operations can be public or irreversible (publishing a site, merging a change request), so confirm first.
- `get_usage_guide` with topic `onboarding` is a cheap read-only call to confirm the connection works.

## Published-docs MCP (read-only)

Every published GitBook site serves its own read-only MCP at `{site-url}/~gitbook/mcp` (for example `https://gitbook.com/docs/~gitbook/mcp`). It only exposes already-published content and is a different server from the workspace MCP.
