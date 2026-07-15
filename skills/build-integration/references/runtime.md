# Integration runtime reference

Everything in an integration flows through three factory functions from `@gitbook/runtime` — `createIntegration`, `createComponent`, `createOAuthHandler` — plus the `context.environment` object and the event system.

## createIntegration

The entry file default-exports this. All three keys are optional; use what the integration needs.

```tsx
import { createIntegration } from '@gitbook/runtime';

export default createIntegration({
    fetch: async (request, context) => {
        // Handle HTTP requests to the integration's public endpoint
        return new Response(JSON.stringify({ message: 'Hello World' }), {
            headers: { 'Content-Type': 'application/json' },
        });
    },
    components: [myComponent],   // from createComponent()
    events: {
        space_view: async (event, context) => { /* ... */ },
    },
});
```

| Key | Type | Purpose |
| --- | --- | --- |
| `fetch` | async fn | Handles incoming HTTP requests / action dispatches. Standard Fetch API `Request` in, `Response` out. |
| `components` | array | UI component definitions. |
| `events` | object | Event name → handler. |

## createComponent

```tsx
const myComponent = createComponent({
    componentId: 'unique-id',                      // must match manifest blocks[].id
    initialState: (props) => ({ message: 'Click me' }),
    action: async (element, action, context) => {
        switch (action.action) {
            case 'say':
                return { state: { message: 'Hello World' } };
            default:
                return {};
        }
    },
    render: async (element, context) => (
        <block>
            <button label={element.state.message} onPress={{ action: 'say' }} />
        </block>
    ),
});
```

| Key | Type | Purpose |
| --- | --- | --- |
| `componentId` | string | Unique id; ties the component to its manifest block entry. |
| `initialState` | `(props) => object` (or plain object) | Initial state from props. |
| `action` | async fn | Reducer for UI events; returns `{ state }`, `{ props }`, or `{}`. |
| `render` | async fn | Returns ContentKit markup. Runs on GitBook's backend on **every** interaction. |

Rendering model: user interacts → action dispatched to the integration → reducer returns new state → GitBook re-renders the component with that state and displays the returned ContentKit. There's no client-side state you own; the loop is server-side and asynchronous (except dynamic binding — see `contentkit.md`).

## Events

```tsx
events: {
    space_content_updated: async (event, context) => { /* ... */ },
}
```

| Event | Fires when |
| --- | --- |
| `installation_setup` | Integration installed for the first time — and again on every configuration edit. |
| `space_installation_setup` | Installed into a specific space. |
| `space_view` | A user views a space. |
| `ui_render` | The integration's UI component renders. |
| `space_content_updated` | Space content changes. |
| `space_visibility_updated` | Space visibility settings change. |
| `space_gitsync_started` | Git Sync begins for a space. |
| `space_gitsync_completed` | Git Sync completes for a space. |

Some events require the matching manifest scopes. In `installation_setup`, check `environment.installation.status !== 'active'` to distinguish "just installed, config incomplete" from a config edit on a working installation.

## context.environment

Available in `fetch`, `render`, `action`, and event handlers.

```tsx
const { apiEndpoint, integration, secrets } = context.environment;
```

| Key | Contents |
| --- | --- |
| `apiEndpoint` | URL of the GitBook HTTP API. |
| `apiTokens` | Authentication tokens for the API. |
| `integration` | Details about the integration itself, including `integration.urls.publicEndpoint` — the base URL for OAuth redirects and incoming requests. |
| Site/space installation | `space` (id), `status` (`active` / pending / paused), `configuration` (the installer's values from the manifest `configurations.site` schema), `externalIds`, `urls`. |
| Org installation | `id`, `space_selection` (all vs selected spaces), `configuration` (from `configurations.account`), `urls`, `externalIds`, `target`. |
| `secrets` | Runtime secrets declared in the manifest `secrets` key. |

Prefer `context.api` — a pre-authenticated `@gitbook/api` client — over constructing your own client from `apiTokens` when calling the GitBook API from inside the integration.

## createOAuthHandler

For authenticating installers against an external provider (Slack, Linear, GitHub…). Wire it to the `button`-type configuration property's `callback_url` inside your `fetch` handler — don't hand-roll the redirect/token exchange.

```tsx
import { createOAuthHandler } from '@gitbook/runtime';

const oauthHandler = createOAuthHandler({
    redirectURL: `${environment.integration.urls.publicEndpoint}/oauth`,
    clientId: environment.secrets.CLIENT_ID,
    clientSecret: environment.secrets.CLIENT_SECRET,
    authorizeURL: 'https://linear.app/oauth/authorize',
    accessTokenURL: 'https://api.linear.app/oauth/token',
    extractCredentials: (response) => {
        if (!response.ok) {
            throw new Error(`Failed to exchange code for access token ${JSON.stringify(response)}`);
        }
        return {
            configuration: {
                oauth_credentials: { access_token: response.access_token },
            },
        };
    },
});
```

| Parameter | Required | Purpose |
| --- | --- | --- |
| `clientId` | yes | OAuth client id (from `secrets`). |
| `clientSecret` | yes | OAuth client secret (from `secrets`). |
| `authorizeURL` | yes | Provider's authorization URL. |
| `accessTokenURL` | yes | Provider's token exchange URL. |
| `redirectURL` | no | Static redirect URL if needed; typically `<publicEndpoint>/oauth`. |
| `scopes` | no | Provider scopes to request. |
| `prompt` | no | e.g. `"consent"`. |
| `extractCredentials` | yes in practice | Maps the token response into `{ configuration: {...} }`, which is persisted onto the installation — the token then comes back via `environment.installation.configuration`. |

The full flow: manifest declares a `button` property with `callback_url: /oauth` → user clicks Authorize → GitBook routes the request to your `fetch` → you invoke the OAuth handler for that route → credentials are stored in the installation configuration → validation passes → installation goes `active`.

## HTTP in and out

Incoming: the `fetch` handler receives standard `Request` objects addressed to the integration's public endpoint (GitBook wraps raw event delivery for you; you rarely touch the underlying multipart `POST /{version}` transport).

Outgoing: use the standard Fetch API.

```tsx
const res = await fetch('https://api.example.com/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello World' }),
});
```

## Local development behavior worth remembering

- `gitbook dev` only works after the integration is published and installed in at least one space/site.
- The dev server URL is not for browsers — traffic is proxied from GitBook. Test inside `app.gitbook.com/o/<org_id>/s/<space_id>`.
- `console.log` output can land in the *browser* console (render/action paths) or your terminal, depending on where the code executes. Check both.
- UI changes require a browser refresh; disable browser caching during development.
