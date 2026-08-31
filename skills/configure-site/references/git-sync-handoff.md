# Git Sync handoff

Git Sync can now be configured for an entire **site** in one pass, mapping every space to a directory in a single repo/branch via `gitbook-docs.yaml`. **This is the default workflow — always reach for site-wide Git Sync first.** Per-space ("individual space") Git Sync still exists, but treat it as a fallback for the specific case where one space needs to live in a different repo or branch than the rest of the site (e.g. a private space, or content that must stay out of the public docs repo).

GitBook's API does not let you fully self-serve this setup yet: connecting the GitHub/GitLab account (OAuth), picking the repository, and choosing the branch and initial sync direction are UI-only. There is an API operation, `installGitSyncProviderOnTarget`, that accepts either a site or a space as its target — but as of this writing it isn't exposed through the GitBook MCP server, and the account-connection step still has to happen in the app first regardless. GitBook has said they're exploring letting a connection be set up once and reused across the API, but that isn't available yet. Don't build a flow around it — check `search`/`describe_operation` for `installGitSyncProviderOnTarget` if you want to confirm current availability, but default to the UI handoff below.

This file is the template for the user-facing instructions you generate so the user can finish wiring it up themselves.

## Pre-handoff checklist

Before generating the handoff, make sure all of this is true:

- The local repo is committed and pushed to a remote (GitHub or GitLab).
- You know the site's **Project directory** — the path in the repo where `gitbook-docs.yaml` should live. Leave this blank for a repo root; set it only when the docs live in a subdirectory of a larger monorepo (e.g. alongside application code).
- You know each space's **content directory** — the path (relative to the project directory, or from the repo root with a leading `/`) that maps to that space. This is what you'd pre-author into `gitbook-docs.yaml` if you scaffolded the repo yourself; see `content-configuration.md` conventions below.
- You know which branch the user wants to sync from (default: `main`).
- The site exists in GitBook (you have its dashboard URL).
- You know whether the repo content should overwrite GitBook (repo is the source of truth — the normal case for a fresh scaffold) or whether GitBook's existing content should overwrite the repo.

If any of those is false, finish that prep work first. Don't ask the user to context-switch into the GitBook UI before everything is ready.

**If you scaffolded the repo yourself**, pre-author `gitbook-docs.yaml` at the project directory with each space already mapped (see the example below) and commit/push it before handoff. GitBook reads the existing mapping on first sync, so the user has less to fill in by hand during **Map your spaces**. Verify the mapping still matches what you tell them to enter in the UI — GitBook creates or updates `gitbook-docs.yaml` when it saves the content mapping, so the two need to agree.

```yaml
# gitbook-docs.yaml, at the project directory (repo root if unset)
$schema: https://api.gitbook.com/openapi.yaml#/components/schemas/GitSyncSiteConfig
site:
  title: [Site title]
  structure:
    - type: space
      key: guides
      title: Guides
      path: guides
      content:
        directory: ./guides
    - type: space
      key: api-reference
      title: API Reference
      path: api-reference
      content:
        directory: ./api-reference
```

## The handoff template

Fill in the bracketed values and present this to the user:

---

> ## Setting up Git Sync — one short step in the GitBook UI
>
> Everything else is done. To finish, you need to connect the site to your repo and confirm which directory maps to which space. This is the one part that GitBook's API doesn't expose, so it has to happen in the UI. It takes about a minute for the whole site — you don't need to repeat this per space.
>
> ### Open Git Sync for the site
>
> 1. Open the site dashboard: **[https://app.gitbook.com/o/<orgId>/sites/<siteId>](https://app.gitbook.com/...)**
> 2. Open **Git Sync** in the sidebar.
> 3. Connect **[GitHub / GitLab]**.
>    - **GitHub**: authorize the GitBook app if prompted. If you hit a "potential duplicated accounts" error, that means your GitHub account is already linked to a different GitBook user — log out and sign in with GitHub directly to find which account, then unlink it in Settings before retrying.
>    - **GitLab**: create a Personal access token in GitLab (user settings → Access tokens) with the `api`, `read_repository`, and `write_repository` scopes, then paste it in. If the token has a role, use `Maintainer` or `Admin`.
> 4. Under **Source repository**, select **`[owner/repo]`** and branch **`[main]`**. If the branch doesn't exist yet, GitBook creates it on first sync.
> 5. Choose the initial sync direction: **[GitHub/GitLab → GitBook]**, since the repo is the source of truth. *(Only pick "Swap direction" if GitBook's existing content should overwrite the repo instead — double-check before confirming, this isn't easily undone.)*
> 6. Click **Show advanced options** and set **Project directory** to **`[repo root, or subdirectory if this is a monorepo]`**.
> 7. Under **Content mapping**, map each space to its directory:
>    - **`[Space 1 Title]`** → **`[./guides]`**
>    - **`[Space 2 Title]`** → **`[./api-reference]`**
>    - *(repeat for each space)*
> 8. Click **Sync** and wait for the import to finish.
>
> Once you've done this, let me know and I'll verify the site's sync state and apply the branding settings.

---

## When a space needs its own repo or branch

Use individual space Git Sync only when one space genuinely can't share the site's repo/branch — for example, a private space that must stay out of the public docs repo. Two ways in:

- **Excluding a space already in site-wide Git Sync**: in the site's Git Sync content mapping, click the remove icon next to that space. GitBook then asks whether to (a) point it at the site's own repo/branch (adds it back into site-wide sync) or (b) point it at an independent repo/branch (space-level sync).
- **A space that was never part of site-wide sync**: in that space, click **Set up** next to **Git Sync** in the space header, then choose **GitHub Sync** or **GitLab Sync** from the provider list and follow the same connect → select repo/branch → direction → project directory steps, scoped to just that space.

Don't default to this path — it fragments where content lives and each space then needs its own handoff and verification. Reach for it only when the user has a concrete reason a space can't share the site's repo.

## Verifying afterwards

After the user confirms they're done, verify each space programmatically (there's no site-level Git Sync status endpoint yet — check per space):

```bash
for space_id in $SPACE_IDS; do
  echo "=== $space_id ==="
  curl -s -H "Authorization: Bearer $GITBOOK_TOKEN" \
    https://api.gitbook.com/v1/spaces/$space_id/git/info
done
```

For each space, expect a 200 with `{repoName, installationProvider, integration, url, updatedAt}`. A 404 means sync isn't set up — point the user back to the relevant step.

Common issues:

- **"Repository not found"** in the UI — the GitBook app doesn't have access. For GitHub: Settings → Applications → GitBook → Configure, and grant access to the right repo. For GitLab: confirm the access token has `api`, `read_repository`, `write_repository`.
- **Initial sync direction wrong** — if the user picks "GitBook → GitHub/GitLab" by mistake when the repo's content should have won, GitBook will overwrite the repo with GitBook's (possibly empty) content. They can't undo this except by `git revert`. Be very explicit in the instructions about direction.
- **Project directory vs. content mapping confusion** — the site's **Project directory** is only where `gitbook-docs.yaml` lives; each space's actual content directory is set separately in **Content mapping**. Getting these swapped is the most common setup mistake with the new site-wide flow. They can fix the mapping afterward in the site's Git Sync settings, which rewrites `gitbook-docs.yaml`.
- **Protected branch push errors** — the GitBook app needs to bypass branch protection rules to push. On GitHub: repo settings → branch protection → allow `gitbook-com` to bypass. On GitLab: if `main` is protected, sync from a separate branch and merge that into `main` manually.

## When there is no remote (local-only)

Git Sync requires a hosted remote — GitBook reaches the repo over the public Git provider APIs, not via direct file access. If the user explicitly chose local-only, they'll need to either push to a hosted remote later (GitBook supports private repos) or skip Git Sync and use the API content path. Tell them this clearly rather than implying Git Sync is possible without a remote.

## Other things worth mentioning in the handoff

- **PR previews (GitHub only)**: once Git Sync is set up, PRs against the synced branch automatically get a status check with a preview link, as long as the GitBook GitHub app has read access to PRs. Previews are skipped by default for PRs from forks (a security default, configurable in Git Sync settings) and aren't available on sites behind authenticated access.
- **Enterprise IP allowlisting**: if the user's network restricts outbound traffic, they'll need to allow these five IPs: `34.136.22.210`, `34.29.189.57`, `35.223.181.150`, `34.72.115.112`, `136.116.236.109`.
- **Commit messages**: GitBook's default export commit message is `GITBOOK-<num>: <change request subject>`. This is customizable in the Git Sync advanced options — mention it if the user has commit message conventions to follow.
