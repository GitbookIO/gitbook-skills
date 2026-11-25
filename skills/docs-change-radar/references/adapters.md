# Optional tools and team settings

GitBook and GitHub are covered in `gitbook-and-github.md`. This file covers what varies by team: trackers, chat, reviewers, and where the style guide lives. Use the connector, MCP server, or CLI already in the session. Check your own tool list before asking the user, and do not install or authorize anything without asking. If two tools fit, prefer the one the request came through.

When a tool is missing, do the rest of the run, write the missing artifact as text to paste, and say so.

## Tracker

Used to read a source ticket, search for and create follow-ups, link the draft, and change status.

- **Linear**: read by identifier (`ENG-123`); comments are fetched separately. Relate follow-ups to the source issue. Statuses and labels are per team, so list them before setting one.
- **Jira**: read by key (`PROJ-123`); linked pull requests are in the development panel. Link follow-ups with "relates to". List available transitions before moving a ticket.
- **GitHub Issues**: `gh issue view <n> --comments`; `gh issue create` for follow-ups, referencing the source in the body. Labels stand in for status.

No tracker, or no source ticket: work from the pasted context. Follow-ups go in a checklist in the draft description by default, or as paste-ready tickets if the team prefers.

A follow-up carries:

```
<Page title> may be out of date after <reference>

Change: <what changed>
Page: <title> (<path or URL>)
Line: "<quoted line>"
Why: <what a reader would now get wrong or miss>
Source: <link, or "pasted context" and a one-line summary>
Docs draft: <link>
```

## Thread

Reply where the request was made: the chat thread, the ticket's comments, or the conversation itself. Do not start a new one elsewhere. Keep messages short: what changed, the links, who is reviewing, what is open.

Resolve a person to a handle through the tool's user search before mentioning them. If the search returns several people or none, write the name as plain text and say you could not resolve it.

## Delivery

| | Pull request | Change request |
| --- | --- | --- |
| Use when | Git-synced space and a checkout | No Git Sync, or no checkout |
| Draft | Branch, commit, open as draft | `create_change_request`, then `updateChangeRequestContent` |
| Preview | GitBook commit status on the pull request | Site URL plus `/~/changes/<number>/` |
| Publish | Merge; Git Sync imports it | `mergeChangeRequest` (MCP: `submit_or_merge_change_request`) |

With a checkout of a Git-synced repository, use the pull request: the repository is the source of truth, and a change made beside it returns as an export commit to reconcile. A site whose spaces differ may need one of each; link them to each other and to the source.

Anchor a comment to the page it concerns, and include the proposed text so the author can accept it as written. Post change-request comments as a JSON document, with one paragraph block per paragraph. A Markdown body is stored as literal text, asterisks included.

## Reviewers

Look in this order and say where each name came from:

1. The reviewer map in `docs-flow.yaml`.
2. `CODEOWNERS` for the paths the draft touches.
3. The source: a pull request's author or a ticket's assignee for accuracy, the reporter or product owner for intent. On a docs-team ticket the assignee is usually the requester, so follow its links to the engineering change instead.
4. Ask.

A name on a ticket is not an account. Resolve each reviewer in the delivery tool and confirm the match before requesting.

## Style guide

`SKILL.md` has the lookup order and how to apply it. By location:

- **GitBook**: a space attached to the site. List the organization's style guides, take the one whose sites include this site, and read its pages as Markdown. If several exist and none references this site, ask which applies.
- **Repository**: the path in `docs-flow.yaml`, a `STYLE.md`, or a style section in `AGENTS.md` or a contributing guide.
- **Elsewhere**: a URL or shared document. If nothing in the session can open it, ask for the relevant parts to be pasted and note that in the plan.

## Running Step 8 on a schedule

A team that wants the publish check automatic can schedule a prompt like this with whatever the platform offers:

```
Check every open docs draft created by docs-change-radar. Report each one that is approved
with no open comments and ask before merging. For the rest, say who it is waiting on.
```

An unattended run that cannot ask stops at "approved and ready to merge" and reports that.
