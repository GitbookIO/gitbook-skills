# Configuring the "Test it" runner

The interactive runner (powered by Scalar) lets readers send real requests from the page. It can only do what the spec describes: it targets the URLs in `servers` and only offers the auth declared under `components.securitySchemes`. This file covers how to wire those together, plus CORS and the proxy.

## Contents

- Declare an auth scheme (Bearer/JWT, API key, OAuth2)
- Apply schemes globally or per operation
- Customize the auth prefix and token placeholder
- Control the endpoint URL with `servers`
- CORS: the usual reason requests fail
- Route requests through the proxy
- Hide the runner

---

## Declare an auth scheme

The runner can only present and apply auth if the spec declares it. Define schemes under `components.securitySchemes`. Use straight quotes in YAML.

**HTTP Bearer (e.g. JWT):**

```yaml
openapi: '3.0.3'
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

**API key in a header:**

```yaml
components:
  securitySchemes:
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
```

**OAuth2 (authorization code flow):**

```yaml
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: 'https://auth.example.com/oauth/authorize'
          tokenUrl: 'https://auth.example.com/oauth/token'
          scopes:
            read:items: 'Read items'
            write:items: 'Write items'
```

## Apply schemes globally or per operation

A top-level `security` applies to every operation; a `security` on an operation overrides the global value for that endpoint.

**Global:**

```yaml
openapi: '3.0.3'
security:
  - bearerAuth: []
paths: ...
```

**Per operation:**

```yaml
paths:
  /reports:
    get:
      summary: Get reports
      security:
        - apiKeyAuth: []
      responses:
        '200':
          description: OK
```

## Customize the auth prefix and token placeholder

Adjust how a security scheme renders in the runner:

- `x-gitbook-prefix` sets the prefix before the token, giving `Authorization: <prefix> YOUR_API_TOKEN`. It is not supported on `http` schemes, which must follow standard IANA authentication definitions.
- `x-gitbook-token-placeholder` sets the default token value shown to the reader.

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

## Control the endpoint URL with `servers`

The runner sends requests to the URL(s) in `servers`. Declare one or more, and parameterize with variables if needed.

**Single server:**

```yaml
servers:
  - url: https://instance.api.region.example.cloud
```

**Multiple servers** (reader picks one):

```yaml
servers:
  - url: https://api.example.com
    description: Production
  - url: https://staging-api.example.com
    description: Staging
```

**Server variables:**

```yaml
servers:
  - url: https://{instance}.api.{region}.example.cloud
    variables:
      instance:
        default: acme
        description: Your tenant or instance slug
      region:
        default: eu
        enum: [eu, us, ap]
        description: Regional deployment
```

**Per-operation server:**

```yaml
paths:
  /reports:
    get:
      summary: Get reports
      servers:
        - url: https://reports.api.example.com
      responses:
        '200':
          description: OK
```

## CORS: the usual reason requests fail

Browsers block cross-origin requests unless the API opts in. By default the runner sends requests from the reader's browser, so a spec added by URL needs the API to allow cross-origin GET requests from the docs origin (for example `https://your-site.gitbook.io` or a custom domain). A public, credential-free endpoint can return `Access-Control-Allow-Origin: *`.

If the API cannot send the right CORS headers, use the proxy instead.

## Route requests through the proxy

GitBook can proxy requests server-side so they work even without CORS. Enable with `x-enable-proxy`.

**Whole spec:**

```yaml
openapi: '3.0.3'
x-enable-proxy: true
info:
  title: Example API
  version: '1.0.0'
servers:
  - url: https://api.example.com
```

**Per operation** (operation value takes precedence over the root):

```yaml
paths:
  /reports:
    get:
      summary: List reports
      x-enable-proxy: true
      responses:
        '200': { description: OK }
    post:
      summary: Create report
      x-enable-proxy: false
      responses:
        '201': { description: Created }
```

What it supports and its limits:

- Forwards all HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), headers, cookies, and request bodies.
- Only forwards to URLs listed in the spec's `servers` array; it cannot reach arbitrary URLs. List every base URL you want to test, or requests to an unlisted host bypass the proxy.

## Hide the runner

Remove the "Test it" panel from an endpoint, or from the whole spec by placing it at the root.

```yaml
paths:
  /example:
    get:
      operationId: examplePath
      x-hideTryItPanel: true
```
