# The radar sweep

The radar answers one question: besides the page the request names, what else on this site does the change make wrong, incomplete, or out of date? Search widely with the brief's terms, read each hit in context, and sort it into a kind.

## Build the term list

Use the docs' vocabulary as well as the source's. An engineer writes "provision a workspace" where the docs say "create your team". If the source's terms hit only the changelog, you are searching in the wrong vocabulary; the site is not clean.

Expand each term into the forms it takes in prose:

- **Names**: the feature, its older names and abbreviations, the screen or menu it lives under.
- **UI strings**: button labels, menu paths, field and toggle names.
- **Identifiers**: endpoints, parameters, CLI flags, config keys, error codes and messages.
- **Numbers**: limits, quotas, prices, versions, with and without units ("50 MB", "50MB").
- **Concept phrases**: how a writer would describe it without naming it ("invite a teammate").

What to weight, by type of change:

| Change | Search hardest for |
| --- | --- |
| Rename | The old term. Every remaining use is a finding. |
| Removal | The removed thing and the steps that led to it. |
| Changed prerequisite (role, plan, permission, limit) | Every page that walks through the task. |
| New feature, or a deprecated term the docs never used | Concept phrases. Expect the old-term search to be empty. |

## Where to search

| Location | Why |
| --- | --- |
| Every page in every in-scope space | The main target |
| `SUMMARY.md`, page titles, `gitbook-docs.yaml` | Renames reach navigation and space titles |
| `.gitbook/includes/` | One stale reusable block is stale everywhere it is included; fix it at the source |
| `.gitbook/vars.yaml`, page `vars:` | A changed limit or version may be one variable |
| Frontmatter `description:` | Shows in search results and previews |
| OpenAPI specs and tag descriptions | Generated reference goes stale at the spec |
| Image alt text, captions, filenames | The only searchable trace of a screenshot |
| Redirects (`.gitbook.yaml`, site redirects) | A moved or renamed page needs one |
| Code samples | Old flags and field names live longest here |

A site-synced repository has one `SUMMARY.md` and `.gitbook/` per space directory. Not every repository has every row: report a missing location as "none here", not as clean. Site header, footer, and announcement links are not in the repository; list them as not swept unless you can read the site's customization.

## How to search

**With a checkout** (preferred): search files directly, case-insensitively, including dot-directories.

```bash
rg -n -i --hidden -g '!.git' -e 'old feature name' -e 'Settings > Billing' -e '50 ?MB'
grep -rnIiE --exclude-dir=.git -e 'old feature name' -e 'Settings > Billing' -e '50 ?MB' .
```

- Log the hit count for every term, pages and changelog separately; the log is what makes "every hit was read" checkable.
- Search large generated files (a bundled spec, the changelog, mirrored documents) separately so they do not bury the pages.
- If a term is too broad to read hit by hit, read that feature's section of the site in full and say so.
- For a reusable block or variable, also list every page that uses it.

**Without a checkout**: use GitBook content search (`searchSiteContent`, or `searchSpaceContent` per space), then fetch each hit page as Markdown and read around the match. Search returns ranked excerpts, not everything, so also read the sections nearest the change in full, and say the sweep ran over search.

## Reading a hit

A term on a page is not a finding. A statement the change makes untrue is.

- **Must change**: asserts something now false; a step that cannot be followed; a sample that no longer runs; an old name for a renamed thing; a task whose prerequisite changed.
- **Link to add**: a natural route to the new content (overview, card grid, "next steps") that does not point to it yet.
- **Probably affected**: a reader would now be missing something, or you cannot tell without an answer from "Not established".
- **Worth a look**: reads correctly either way.
- Otherwise drop it.

The line between must change and probably affected is whether you know what the page should say. If the source establishes the new statement, a current task or reference page that says otherwise is a must change, however thin the rest of the source is. If the wording depends on something not established, or the page is an older tutorial that needs more than a corrected sentence, it is probably affected. On a thin source, keep probably affected for pages where a reader acts on the thing that changed; definitions and passing mentions are worth a look.

Then look one step outward from the main-edit page and each must-change page: pages that link to it, its neighbours in the navigation, and pages that cover the same task from another angle.

## Screenshots

If the source describes nothing a reader would see change (a permission rule, a backend limit) and names nothing a screenshot could show, there is nothing to compare against: name the affected pages' images under "Not checked" in the record and move on. Otherwise:

1. Search alt text, captions, and filenames for the terms.
2. Add every image on the main-edit, must-change, and probably-affected pages, skipping inline icons and logos.
3. Open the candidates and compare them with the source's description or designs.

Report mismatches as screenshots to re-capture, with page, image path, and what differs. Never generate or edit a product screenshot; a fabricated one is a false record. Diagrams written as code are fixed like text. Alt text or a caption that names the changed thing is a text finding in its own right.

## What not to flag

- **Changelog and release-note entries.** Correct for their date. Read them as evidence.
- **Translated variants.** They follow the source language.
- **Docs for older versions** the change does not apply to.
- **Archived or hidden pages**, unless still reachable by link (then worth a look).
- **Generated or mirrored files.** Note the hit and where the source of truth is; do not edit the copy.
- **Style-only problems** unrelated to the change.
- **Quoted material**: customer quotes, sample output, example data.

## Reporting

Findings go in the plan in `SKILL.md`: edits as numbered changes with proposed text, the rest in the record. Keep a search log as you go (each term, its hit count, pages and changelog counted separately, and what you read in full) but leave it out of the plan; offer it, and hand it over when asked. In the plan, a clean result is one line naming the terms and areas that came back with nothing.
