# What GitBook writes back on export

Git Sync is a round-trip, not a one-way import. When GitBook exports a space back to the repo it re-serialises every page it touched from its own document model — it does not hand your file back byte-for-byte. Anything GitBook treats as equivalent to what you wrote can come back in a different shape.

For a Git-first team this is the biggest source of confusion, because it lands as diff noise on a commit nobody made by hand. Two consequences matter more than any individual normalisation below:

1. **Expect a diff after the first export.** The commit following GitBook's first export of hand-authored content will touch files you didn't edit. That's normalisation, not corruption. Review it once, commit it, and later syncs stay quiet.
2. **Lint for validity, never for form.** A validator that demands one specific serialisation — quoted descriptions, a particular link form, a fence style — will fight Git Sync on every sync and lose. This has already happened: a team added a build step requiring quoted `description:` values, GitBook re-emitted them as block scalars, and the two rewrote each other across syncs until the check was relaxed. Check that frontmatter parses and that links resolve. Don't check how they're written.

## `description:` scalar style

GitBook emits whichever YAML scalar style its serialiser picks for the value, the way any YAML library would:

| The value | What GitBook writes |
| --- | --- |
| Short, nothing special in it | Plain scalar — `description: Accept your first payment` |
| Long (past roughly 80 columns) | Folded block scalar — `description: >-` followed by wrapped, indented lines |
| Contains something that needs quoting (a non-breaking space, a leading `>`, and so on) | Double-quoted |

All three are valid YAML and all three mean the same thing. Whichever one you wrote is not preserved, so don't build anything that depends on it.

What you do still have to get right is the input. An unquoted plain scalar containing `: ` is invalid YAML, and the page imports with an empty description and no error at all. Quote on the way in — see `frontmatter.md` — and take whatever comes back out.

## Cross-space link URL form

Two forms exist and both resolve:

```
https://app.gitbook.com/s/<spaceId>/<path>
https://app.gitbook.com/o/<orgId>/s/<spaceId>/<path>
```

**Write the short form.** It is what GitBook emits in almost every case: GitBook's own Git-synced documentation repo contains 430 short-form cross-space links across 64 files, against a single real org-qualified one.

The org-qualified form is a valid alias, not a mistake, and it does appear in exported content — including in content whose target space sits in the same site as the short-form links beside it. Exports have been seen rewriting short-form links to the org-qualified form, but the trigger isn't established and it clearly isn't universal; GitBook mostly preserves whichever form is already in the file.

So: write the short form, leave the org form alone when you meet it, and don't lint for either. Neither is canonical, and a check that rewrites one into the other will churn against Git Sync.

## Other normalisations worth knowing about

- **Blocks re-serialise.** Multi-line GitBook blocks come back reformatted — attribute order and whitespace shift, and some arrive collapsed onto one line. `cr-create`'s "Editing an existing page safely" section covers the lossy round-trip in detail.
- **`gitbook-docs.yaml` gets rewritten.** Saving the content mapping in the site's Git Sync settings rewrites the file, so a hand-authored mapping and the one in the UI have to agree. See `configure-site`'s `references/git-sync-handoff.md`.
- **Unresolvable links are marked, not dropped.** A link GitBook can't resolve exports as `/broken/pages/<pageId>`. In a diff that's a real broken link to fix at the source, not noise to ignore.

## When a diff surprises you

Don't revert it. Check that what GitBook wrote is valid and means the same thing, then commit it. If it looks genuinely wrong, compare against a page in the same space you know is correct before filing anything. Reverting a normalisation only queues the same rewrite for the next sync.
