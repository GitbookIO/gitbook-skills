# Previewing a pushed branch (Git Sync)

When a repository is synced with GitBook, opening a pull/merge request — or pushing to a
branch that already has one — makes GitBook import that branch and post a **commit status**
on the head commit. The status links a preview of the changes.

**Give the user that link whenever you push docs changes, without waiting to be asked.**
Every push re-imports and mints a new revision, so a link from an earlier push is stale.

**Never build the URL yourself.** The revision id is generated at import time and cannot be
derived from the branch name, the commit, or the PR number. Read `target_url` off the status.

## Two statuses, two purposes

GitBook posts up to two statuses, distinguished by their context name:

| Context | What it is | Give to the user when |
|---|---|---|
| `GitBook - <host>/<path>` | the **rendered site preview** | they want to see how the docs will look |
| `GitBook` (bare) | the **editor diff** in the GitBook app | they want to review what changed |

For "can I see my changes," you want the first one.

## GitHub

```bash
gh api "repos/{owner}/{repo}/commits/$(gh pr view <number> --json headRefOid -q .headRefOid)/status" \
  --jq '.statuses[] | select(.context | startswith("GitBook")) | {context, state, target_url}'
```

`{owner}/{repo}` is expanded by `gh` from the local remote — leave it literal. `<number>` is
the PR number.

In the GitHub web UI the same statuses appear in the merge box at the bottom of the PR (you
may need "Show all checks"), and behind the ✓/●/✗ icon next to the commit in the Commits tab.

## GitLab

The mechanism is the same — merge request open/update triggers the import, and GitBook posts
a commit status with a target URL — but `gh` does not apply. Read the statuses from the
GitLab API.

> The GitHub path above has been run end to end. **This GitLab snippet has not** — it is
> written from the API contract, so treat the exact field names as unconfirmed and check the
> raw response if it doesn't behave. `$GITLAB_TOKEN` needs `read_api` scope.

```bash
curl -sS --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "https://gitlab.com/api/v4/projects/<project-id>/repository/commits/<sha>/statuses" \
  | jq '.[] | select(.name | startswith("GitBook")) | {name, status, target_url}'
```

On self-managed GitLab, swap the host. The field names differ from GitHub's: `name` rather
than `context`, `status` rather than `state`. In the web UI the statuses show on the merge
request's pipeline/commit view.

## While the import is still running

The status is `pending` until the import finishes. Re-check every 15 seconds or so, and only
report a link once its state is `success`. Give up after a few minutes and tell the user the
import hasn't completed rather than handing over a pending link.

If the query returns **nothing at all**, either the import hasn't started yet or Git Sync
isn't configured for this repository. Retry a couple of times before concluding the latter —
the two are indistinguishable from a single empty result.

If the state is `failure` or `error`, the import itself failed. Say so and point the user at
the status's `target_url`; don't present it as a preview.
