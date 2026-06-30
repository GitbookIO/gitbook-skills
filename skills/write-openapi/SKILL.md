---
name: write-openapi
description: >-
  Author, configure, structure, and troubleshoot OpenAPI/Swagger API reference
  documentation in GitBook. Use this whenever a task involves a GitBook OpenAPI
  block or `{% openapi %}` block, adding or updating an OpenAPI/Swagger spec in
  GitBook (by file, URL, or the `gitbook openapi publish` CLI), generating API
  reference pages from a spec, configuring the interactive "Test it" runner
  (auth, servers, CORS, proxy), customizing pages with GitBook `x-*` extensions
  (icons, titles, navigation hierarchy, code samples, enum descriptions),
  marking operations experimental/deprecated/hidden, or automating spec updates
  in CI/CD. Trigger even when the user only mentions GitBook plus OpenAPI, puts
  an `x-` extension on a spec destined for GitBook, or asks "why isn't my spec
  loading" or "why doesn't Test it work", without naming this skill.
---

# GitBook OpenAPI

GitBook turns an OpenAPI document into interactive, testable API reference blocks. You give it a spec (as JSON or YAML), and it renders endpoints, parameters, schemas, auth, and an in-page request runner. Most of the customization happens inside the spec itself through `x-*` extensions, not in the GitBook UI, so the bulk of any task here is editing OpenAPI YAML correctly.

This skill covers the full surface: getting a spec into GitBook, generating reference pages, structuring navigation, making the "Test it" runner work, controlling how operations and schemas display, and automating updates from CI/CD.

## Key facts to know first

These shape almost every decision, so internalize them before editing anything.

- **Supported versions.** GitBook accepts Swagger 2.0 and OpenAPI 3.0 specs. Some features need newer versions: webhooks require OpenAPI 3.1, and the official `parent` tag property requires OpenAPI 3.2+ (use `x-parent` on 3.0.x and 3.1.x). Always check the spec's `openapi:`/`swagger:` version before reaching for a version-gated feature.
- **The "Test it" runner is powered by Scalar.** It runs requests from the reader's browser unless you route them through GitBook's proxy.
- **Three ways to add a spec:** upload a file, point at a hosted URL, or publish with the GitBook CLI. The source type changes how updates work (see below).
- **URL specs auto-refresh every 6 hours.** File specs only change when re-uploaded or re-published.
- **`x-*` extensions are namespaced and safe to keep in a shared spec.** Tools that do not understand a given extension ignore it, so a spec instrumented for GitBook still validates and works elsewhere.

## What are you trying to do?

Match the task to the right section. For the deeper reference material, two files live alongside this one:

- Editing or looking up any `x-*` extension, with full YAML for each: read `references/extensions.md`.
- Making the interactive runner work end to end (auth schemes, servers, CORS, proxy): read `references/test-it-setup.md`.

| Task | Go to |
| --- | --- |
| Get a spec into GitBook, or update one | "Add or update a specification" |
| Generate reference pages, or drop a single endpoint/schema into a page | "Insert an API reference" |
| Split, order, nest, title, or icon your pages | "Structure the reference" |
| Make "Test it" work, fix CORS, configure auth | "Configure the Test it runner" + `references/test-it-setup.md` |
| Mark an endpoint experimental, deprecated, or hidden | "Manage operation lifecycle" |
| Look up the exact name/scope of an extension | "Extensions cheat-sheet" + `references/extensions.md` |
| Auto-publish the spec from a pipeline | "Automate with CI/CD" |

## Add or update a specification

A spec must exist in the organization before any block or page can reference it.

**In the GitBook app:** open the **OpenAPI** section in the sidebar, click **Add specification**, give it a name (the name matters: it is how you reference the spec later and how you tell multiple specs apart), then choose to upload a file, enter a hosted URL, or publish via CLI.

**Updating depends on the source:**
- URL source: GitBook checks every 6 hours automatically; click **Check for updates** to pull immediately. You can switch a File source to a URL source via **Edit** in the breadcrumb actions menu.
- File source: click **Update** to upload a new version.

**With the CLI** (same command adds or updates; running it against a URL also forces a refresh):

```bash
gitbook openapi publish --spec <spec-name> --organization <organization-id> <path-or-url>
```

Authenticate the CLI with a `GITBOOK_TOKEN` environment variable. For pipeline automation see "Automate with CI/CD". CLI details: https://gitbook.com/docs/developers/integrations/reference

## Insert an API reference

Once the spec exists, surface it in the docs one of two ways.

**Generate a full set of pages (recommended for a complete reference).** In the target space's table of contents, click **Add new...** at the bottom, then **OpenAPI Reference**, pick the spec, and insert. GitBook creates one page per tag in the spec (see "Structure the reference"), and optionally a models page listing every schema. These pages keep updating whenever the spec updates.

**Insert a single operation or schema into an existing page.** Press `/`, search for **OpenAPI**, pick the spec, choose **Continue**, then select the specific operations and/or schemas to embed.

**Block syntax.** When writing GitBook markdown directly, an OpenAPI operation block looks like this (the inner line repeats the source):

```
{% openapi src="https://petstore3.swagger.io/api/v3/openapi.json" path="/pet" method="post" %}
https://petstore3.swagger.io/api/v3/openapi.json
{% endopenapi %}
```

To highlight one or more schemas inline (for example inside a tag description), use the schemas block:

```
{% openapi-schemas spec="petstore" schemas="Pet" grouped="false" %}
The Pet object
{% endopenapi-schemas %}
```

## Structure the reference

GitBook builds navigation from the spec's `tags`, so structuring the reference is mostly structuring tags. Full YAML for every extension named here is in `references/extensions.md`.

- **Split operations across pages:** give operations the same tag, and each tag becomes its own page.

  ```yaml
  paths:
    /pet:
      put:
        tags:
          - pet
        summary: Update an existing pet.
        operationId: updatePet
  ```

- **Order pages:** page order follows the order of entries in the top-level `tags` array.

  ```yaml
  tags:
    - name: pet
    - name: store
    - name: user
  ```

- **Nest pages into groups:** use `parent` (OpenAPI 3.2+) or `x-parent` (3.0.x/3.1.x) to point a tag at its parent tag.

  ```yaml
  tags:
    - name: everything
    - name: pet
      x-parent: everything
    - name: store
      x-parent: everything
  ```

  If a parent page has no `description`, GitBook automatically renders a card-based layout linking its sub-pages.

- **Add titles, icons, and descriptions per page** via tag-level extensions. Icons accept any Font Awesome name (https://fontawesome.com/search).

  ```yaml
  tags:
    - name: pet
      x-page-title: Pet              # title in the table of contents and page header
      x-page-icon: dog               # icon in the ToC and next to the title
      x-page-description: Pets are amazing!   # shown just above the title
      description: Everything about your Pets # the page body
  ```

- **Write rich descriptions.** Tag `description` fields accept GitBook markdown, including advanced blocks such as `{% tabs %}`, so a page intro can be far more than plain text.

- **Document webhooks** (OpenAPI 3.1) with a top-level `webhooks` field that mirrors `paths`:

  ```yaml
  openapi: 3.1.0
  webhooks:
    newPet:
      post:
        summary: New pet event
        requestBody:
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Pet"
        responses:
          "200":
            description: Received successfully
  ```

## Configure the Test it runner

The interactive runner only works as well as the spec describes it. The runner targets the URLs in the `servers` array and can only present auth that the spec declares under `components.securitySchemes`. For anything non-trivial (Bearer/JWT, API key, OAuth2, multiple or templated server URLs, per-operation overrides), read `references/test-it-setup.md`, which has copy-paste YAML for each pattern.

Two quick decisions you will hit constantly:

- **"Why isn't my spec loading?" / "Why does Test it fail?" (URL specs).** This is almost always CORS. A URL-added spec requires the API to allow cross-origin GET requests from the docs origin (for example `https://your-site.gitbook.io` or your custom domain). Public, credential-free endpoints can return `Access-Control-Allow-Origin: *`.
- **API can't enable CORS?** Route requests through GitBook's proxy with `x-enable-proxy: true` (at the root for the whole spec, or on a single operation; the operation value wins). The proxy forwards all HTTP methods, headers, cookies, and bodies, but only to URLs listed in `servers`, so make sure every base URL you want to test is in that array. Details in `references/test-it-setup.md`.

To remove the runner from an endpoint (or the whole spec), set `x-hideTryItPanel: true`.

## Manage operation lifecycle

Common when endpoints are not production-ready or are being phased out. All of these are operation-level unless noted.

- **Not stable yet:** `x-stability: experimental` (also `alpha` or `beta`).
- **Deprecated:** `deprecated: true`. Deprecated endpoints show a deprecation warning on the published site.
- **Deprecated with an end date:** add `x-deprecated-sunset: 2030-12-05` (ISO 8601, `YYYY-MM-DD`).
- **Hide an endpoint entirely:** `x-internal: true` (or its alias `x-gitbook-ignore: true`).
- **Hide one response sample:** set `x-hideSample: true` on that response object (for example under `responses.200`).

```yaml
paths:
  /pet:
    put:
      operationId: updatePet
      x-stability: experimental
      deprecated: true
      x-deprecated-sunset: 2030-12-05
```

## Extensions cheat-sheet

Every GitBook-supported extension at a glance. For the full YAML example of any row, open `references/extensions.md`.

| Extension | Purpose | Where it goes |
| --- | --- | --- |
| `x-page-title` / `x-displayName` | Display name of a tag (navigation + page title) | tag |
| `x-page-description` | Short description shown above the page title | tag |
| `x-page-icon` | Font Awesome icon for the page | tag |
| `parent` / `x-parent` | Nest a tag under a parent tag (`parent` = 3.2+, `x-parent` = 3.0.x/3.1.x) | tag |
| `x-hideTryItPanel` | Show or hide the "Test it" runner | root or operation |
| `x-expandAllResponses` | Expand all response sections by default | root or operation |
| `x-expandAllModelSections` | Expand all model/schema sections by default | root or operation |
| `x-enable-proxy` | Route "Test it" requests through GitBook's proxy | root or operation (operation wins) |
| `x-codeSamples` | Provide custom code samples (`lang`, `label`, `source`) | operation |
| `x-enumDescriptions` | Per-value descriptions for an `enum`, rendered as a table | schema |
| `x-internal` / `x-gitbook-ignore` | Hide an endpoint from the reference | operation |
| `x-stability` | Mark `experimental`, `alpha`, or `beta` | operation |
| `deprecated` | Mark an operation deprecated | operation |
| `x-deprecated-sunset` | Sunset date for a deprecated operation (`YYYY-MM-DD`) | operation |
| `x-hideSample` | Hide a single response sample | response object |
| `x-gitbook-prefix` | Custom auth prefix (e.g. `Token`); not allowed on `http` schemes | security scheme |
| `x-gitbook-token-placeholder` | Default token placeholder shown in the runner | security scheme |

Two display extensions worth highlighting because they take a root default that operations can opt out of:

```yaml
openapi: '3.0'
x-expandAllResponses: true        # default for every operation
x-expandAllModelSections: true
paths:
  /pets:
    get:
      x-expandAllResponses: false # opt this one out
```

Custom code samples replace GitBook's auto-generated snippets and accept multiple languages:

```yaml
paths:
  /users:
    get:
      summary: Retrieve users
      x-codeSamples:
        - lang: JavaScript
          label: Node SDK
          source: |
            import { createAPIClient } from 'my-api-sdk';
            const client = createAPIClient({ apiKey: 'my-api-key' });
            client.users.list().then(console.log);
        - lang: cURL
          label: CLI
          source: |
            curl -L -H 'Authorization: Bearer <token>' \
              'https://api.example.com/v1/users'
```

## Automate with CI/CD

Publish the spec from any pipeline with the CLI. Set `GITBOOK_TOKEN` as a secret, then run `openapi publish` against a file (generated during the build) or a URL (forces a refresh after a release).

```bash
export GITBOOK_TOKEN=<api-token>
gitbook openapi publish \
  --spec <spec-name> \
  --organization <organization-id> \
  example.openapi.yaml
```

GitHub Actions example, triggered on spec changes to `main`:

```yaml
name: Publish OpenAPI to GitBook
on:
  push:
    branches: ["main"]
    paths: ["**/*.yaml", "**/*.yml", "**/*.json"]
  workflow_dispatch:
jobs:
  publish:
    runs-on: ubuntu-latest
    env:
      GITBOOK_TOKEN: ${{ secrets.GITBOOK_TOKEN }}
      GITBOOK_SPEC_NAME: ${{ vars.GITBOOK_SPEC_NAME }}
      GITBOOK_ORGANIZATION_ID: ${{ vars.GITBOOK_ORGANIZATION_ID }}
    steps:
      - uses: actions/checkout@v4
      - name: Publish spec to GitBook
        run: |
          npx -y @gitbook/cli@latest openapi publish \
            --spec "$GITBOOK_SPEC_NAME" \
            --organization "$GITBOOK_ORGANIZATION_ID" \
            <path_to_spec>
```

