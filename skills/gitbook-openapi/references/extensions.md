# GitBook OpenAPI extensions reference

Complete reference for the `x-*` (and a few native) properties GitBook understands. Extensions are namespaced custom fields; tools that do not recognize one ignore it, so a spec instrumented for GitBook stays valid and portable.

## Contents

- Page and navigation: `x-page-title` / `x-displayName`, `x-page-description`, `x-page-icon`, `parent` / `x-parent`
- Display behavior: `x-hideTryItPanel`, `x-expandAllResponses`, `x-expandAllModelSections`
- Request runner and proxy: `x-enable-proxy`, `x-gitbook-prefix`, `x-gitbook-token-placeholder`
- Content: `x-codeSamples`, `x-enumDescriptions`, `x-hideSample`
- Operation lifecycle: `x-internal` / `x-gitbook-ignore`, `x-stability`, `deprecated`, `x-deprecated-sunset`

For making the interactive runner work as a whole (declaring auth, servers, CORS, proxy together), see `test-it-setup.md`.

---

## Page and navigation

### `x-page-title` / `x-displayName`

Change the display name of a tag, used in navigation and as the page title.

```yaml
openapi: '3.0'
tags:
  - name: users
    x-page-title: Users
```

### `x-page-description`

Add a description shown just above the page title.

```yaml
tags:
  - name: users
    x-page-title: Users
    x-page-description: Manage user accounts and profiles.
```

### `x-page-icon`

Add a Font Awesome icon to the page. Browse names at https://fontawesome.com/search.

```yaml
tags:
  - name: users
    x-page-title: Users
    x-page-description: Manage user accounts and profiles.
    x-page-icon: user
```

### `parent` / `x-parent`

Add hierarchy to tags to nest pages. `parent` is the official property in OpenAPI 3.2+; on OpenAPI 3.0.x and 3.1.x use `x-parent` instead.

```yaml
openapi: '3.2'
tags:
  - name: organization
  - name: admin
    parent: organization
  - name: user
    parent: organization
```

A parent page with no `description` automatically renders a card-based layout linking its sub-pages.

---

## Display behavior

### `x-hideTryItPanel`

Show or hide the "Test it" button and panel. Place at the root to apply everywhere, or on an operation for just that endpoint.

```yaml
paths:
  /example:
    get:
      operationId: examplePath
      x-hideTryItPanel: true
```

### `x-expandAllResponses`

Expand all response sections by default instead of showing one at a time. Root sets the default for every operation; an operation can opt out with `false`.

```yaml
openapi: '3.0'
x-expandAllResponses: true
paths:
  /pets:
    get:
      summary: List pets
      x-expandAllResponses: false   # opt this one out
```

### `x-expandAllModelSections`

Expand all model/schema sections by default, showing nested object properties without a click. Root sets the default; operations can opt out with `false`.

```yaml
openapi: '3.0'
x-expandAllModelSections: true
paths:
  /pets:
    post:
      summary: Create a pet
      x-expandAllModelSections: false   # opt this one out
```

---

## Request runner and proxy

### `x-enable-proxy`

Route "Test it" requests through GitBook's server-side proxy, which bypasses CORS restrictions on the target API. Root applies to every operation; an operation-level value overrides the root. The proxy only forwards to URLs in the `servers` array. Full treatment in `test-it-setup.md`.

```yaml
openapi: '3.0.3'
x-enable-proxy: true            # enable for all operations
paths:
  /health:
    get:
      summary: Health check
      x-enable-proxy: false     # opt out for this one
      responses:
        '200':
          description: OK
```

### `x-gitbook-prefix`

Customize the authorization prefix shown for a security scheme (for example `Token` instead of `Bearer`). Result: `Authorization: <x-gitbook-prefix> YOUR_API_TOKEN`. Not supported on `http` security schemes, which must follow standard IANA authentication definitions.

```yaml
components:
  securitySchemes:
    apiKey:
      type: apiKey
      in: header
      name: Authorization
      x-gitbook-prefix: Token
      x-gitbook-token-placeholder: YOUR_CUSTOM_TOKEN
```

### `x-gitbook-token-placeholder`

Set the default token placeholder displayed in the runner for a security scheme. Result: `Authorization: Bearer <x-gitbook-token-placeholder>`. See the example above.

---

## Content

### `x-codeSamples`

Show custom code samples alongside an operation, replacing GitBook's auto-generated snippets. It is an array of objects.

| Field | Type | Description |
| --- | --- | --- |
| `lang` | string | Language of the sample. Use a value from GitHub Linguist's popular languages list. |
| `label` | string | Optional short label (for example `Node` or `Python2.7`). Defaults to `lang`. |
| `source` | string | The sample source code. |

```yaml
paths:
  /example:
    get:
      operationId: examplePath
      x-codeSamples:
        - lang: cURL
          label: CLI
          source: |
            curl -L \
              -H 'Authorization: Bearer <token>' \
              'https://api.gitbook.com/v1/user'
```

### `x-enumDescriptions`

Add an individual description for each `enum` value in a schema. GitBook renders the values and descriptions in a table next to the operation.

```yaml
components:
  schemas:
    project_status:
      type: string
      enum:
        - LIVE
        - PENDING
        - REJECTED
      x-enumDescriptions:
        LIVE: The project is live.
        PENDING: The project is pending approval.
        REJECTED: The project was rejected.
```

### `x-hideSample`

Exclude a single response from the response samples section. Set it on the response object.

```yaml
paths:
  /pet:
    put:
      operationId: updatePet
      responses:
        200:
          x-hideSample: true
```

---

## Operation lifecycle

### `x-internal` / `x-gitbook-ignore`

Hide an endpoint from the API reference entirely. The two names are aliases.

```yaml
paths:
  /example:
    get:
      operationId: examplePath
      x-internal: true
```

### `x-stability`

Mark endpoints that are unstable or in progress, so users avoid non-production-ready endpoints. Supported values: `experimental`, `alpha`, `beta`.

```yaml
paths:
  /example:
    get:
      operationId: examplePath
      x-stability: experimental
```

### `deprecated`

Mark an operation deprecated (a native OpenAPI field). Deprecated endpoints show a deprecation warning on the published site.

```yaml
paths:
  /example:
    get:
      operationId: examplePath
      deprecated: true
```

### `x-deprecated-sunset`

Add a sunset date to a deprecated operation, in ISO 8601 `YYYY-MM-DD` format.

```yaml
paths:
  /example:
    get:
      operationId: examplePath
      deprecated: true
      x-deprecated-sunset: 2030-12-05
```
