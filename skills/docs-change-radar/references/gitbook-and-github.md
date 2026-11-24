# Doing each step with the GitBook MCP server and GitHub

The default toolset for this skill is the GitBook MCP server (`https://mcp.gitbook.com/mcp`) for everything in GitBook and GitHub for the repository. Nothing here needs an API token in a file or a helper script.

If the GitBook MCP server is not connected, say so and offer the setup command for the user's client. Do not fall back to guessing at content you cannot read.

## How the GitBook MCP server works

It has a few named tools (`list_sites`, `get_site_structure`, `get_page`, `create_change_request`, `submit_or_merge_change_request`, `get_usage_guide`) and three generic ones: `search` finds an API operation by keyword, `describe_operation` shows its inputs, and `invoke_operation` runs it. Anything without a named tool goes through those three. Operation names change less often than you might fear, but when one below is not found, `search` for it by what it does.

Call `get_usage_guide` with topic `editing` before your first content write in a session.

## By step

| Step | Need | GitBook MCP | GitHub |
| --- | --- | --- | --- |
| 1 | Read a source pull request or issue | | `gh pr view <n> --json title,body,files,state,mergedAt,author`; `gh issue view <n> --comments` |
| 1 | Read an existing change request | `getChangeRequestById`, `getChangeRequestChanges`, then `getPageInChangeRequestById` with `format=markdown` for each changed page | |
| 2 | Find the site and its spaces | `list_sites`, `get_site_structure` | `gitbook-docs.yaml` in the repository |
| 2 | Is the space Git-synced? | The site or space object's `gitSync` field | |
| 2 | Read the style guide | `listOrganizationStyleguides`, then `listPages` and `get_page` on that space | A style file in the repository |
| 3 | Sweep with a checkout | | `rg` or `grep` over the clone |
| 3 | Sweep without a checkout | `searchSiteContent` or `searchSpaceContent`, then `get_page` on each hit | |
| 5 | Draft as a pull request | | Branch, commit, `gh pr create --draft` |
| 5 | Draft as a change request | `create_change_request`, then `updateChangeRequestContent` | |
| 5 | Preview link | The site's `urls.published` (or `urls.preview`) plus `/~/changes/<number>/` | The GitBook commit status on the pull request: `gh pr checks <n>` |
| 5 | Comment on someone else's draft | `postCommentInChangeRequest`, with `page` set to anchor it | `gh pr review <n> --comment`, or a suggestion on the line |
| 6 | Record follow-ups | A checklist in the change request description | `gh issue create`, or a checklist in the pull request body |
| 7 | Find and request reviewers | `listSuggestedReviewersForChangeRequest`, `requestReviewersForChangeRequest` | `CODEOWNERS`; `gh pr edit <n> --add-reviewer <login>` |
| 8 | Read review state | `getReviewsByChangeRequestId`, `listCommentsInChangeRequest` | `gh pr view <n> --json reviewDecision,reviews,comments` |
| 8 | Merge | `submit_or_merge_change_request` | `gh pr merge <n>`; Git Sync then imports it |

## Things that go wrong

- **Change request content is whole-page.** `updateChangeRequestContent` with `update_page` replaces the page body. Read the page from the change request, edit that text, and push it back; then read it again to confirm what landed. Leave `/pages/<id>` and `/files/<id>` links exactly as they came.
- **Comments are not Markdown.** Send the comment body as a JSON document with one paragraph block per paragraph. A Markdown body is stored as literal text, asterisks included.
- **Do not create a style guide by looking for one.** The site-level style guide operation is create-or-retrieve. Use the organization list.
- **A bare site URL is not a preview.** Without `/~/changes/<number>/` it shows the live site.
- **A pushed branch needs an open pull request** before GitBook imports it and posts a preview status. The status is pending for a short while; report the link once it succeeds.
- **Do not push the same change both ways.** In a Git-synced space, a change request edit comes back to the repository as an export commit. Pick the pull request or the change request, not both.
- **Git Sync setup is not something to fix mid-run.** If a space is not synced and the user expected it to be, say so and use a change request.

## Other tools

Trackers and chat are optional and vary by team; see `adapters.md`. On GitLab, the same steps apply with `glab` and merge requests. The REST API is an alternative to the MCP server for every GitBook row above; the companion skills `cr-create` and `cr-review` cover it.
