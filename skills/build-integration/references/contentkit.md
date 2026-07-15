# ContentKit reference

ContentKit is the UI vocabulary a component's `render` function returns. It looks like JSX but is a server-rendered description — no DOM, no client-side handlers, no arbitrary CSS. Interactivity flows through actions dispatched back to the integration.

## Core model

- **Props** — bound to the block instance, persisted in the document. Change them with the `@editor.node.updateProps` action. Use props for anything that should survive reloads and appear for every viewer.
- **State** — local, component-scoped, ephemeral working data (form values, toggles). Updated by returning `{ state: {...} }` from the action reducer. Inputs bind to state via their `state` key.
- **Actions** — objects dispatched by interactive elements (`onPress`, `onContentChange`…). Custom actions carry a `action: '<name>'` you switch on in the reducer; built-in actions (prefixed `@`) are handled by GitBook itself.

## Built-in actions

| Action | Payload | Purpose |
| --- | --- | --- |
| `@editor.node.updateProps` | `{ props: {...} }` | Persist new props onto the editor node. |
| `@ui.url.open` | `{ url }` | Open a URL. |
| `@ui.modal.open` | `{ componentId, props }` | Open another component as an overlay modal. |
| `@ui.modal.close` | `{ returnValue? }` | Close the current modal, returning data to the parent's action handler. |
| `@webframe.ready` | — | Sent *from* a webframe: ready to receive messages. |
| `@webframe.resize` | `{ aspectRatio?, maxHeight?, maxWidth? }` | Sent from a webframe to resize its container. |
| `@link.unfurl` | `{ url }` | Delivered to a block when a user pastes a URL matching its manifest `urlUnfurl` patterns. |

## Component reference

### Layout

**`block`** — required top-level element of a custom block.
Props: `children`*, `controls` (block menu items: `{ icon, label, onPress, confirm? }`, where `confirm` is `{ title, text, confirm, style: 'primary'|'danger' }`).

**`vstack`** / **`hstack`** — vertical / horizontal stacks.
Props: `children`*, `align: 'start'|'center'|'end'`.

**`divider`** — Props: `style: 'default'|'line'`, `size: 'small'|'medium'|'large'`.

### Display

**`box`** — generic container. Props: `children`*, `grow` (number, flex-grow share), `style` (e.g. `"card"`).

**`card`** — Props: `children`, `title`, `hint`, `icon`, `onPress`, `buttons`.

**`text`** — Props: `children`*, `style: 'bold'|'italic'|'strikethrough'|'code'`. Nestable: `<text>Hello <text style="bold">World</text></text>`.

**`image`** — Props: `source.url`*, `aspectRatio`*.

**`markdown`** — Props: `content`* (markdown string). The easy way to render rich formatted output.

### Interactive

**`button`** — Props: `label`*, `onPress`* (Action), `style: 'primary'|'secondary'|'danger'`, `tooltip`, `icon`, `confirm` (`{ title*, text*, confirm*, style* }` — confirmation dialog before dispatch).

**`textinput`** — Props: `state`* (binding key), `initialValue`, `label`, `placeholder`. Value readable as `element.state.<key>` when any action fires.

**`select`** — Props: `state`*, `initialValue`, `placeholder`, `multiple`, `options` (`{ id, label, url? }[]`).

**`switch`** / **`checkbox`** / **`radio`** — Props: `state`*, `initialValue`/`value`, optional `confirm`.

**`codeblock`** — Props: `content`*, `syntax`, `lineNumbers`, `buttons` (overlay), `state` (makes it editable, value in state), `onContentChange` (Action). Also the recommended stand-in for prompt-style blocks — there's no dedicated `prompt` component and no built-in clipboard action; add overlay buttons (e.g. `@ui.url.open` with a deeplink) for tool handoff.

**`webframe`** — embeds an iframe. Props: `source.url`*, `aspectRatio`*, `buttons`, `data` (`Record<string, string>` — state dependencies passed into the frame).

**`modal`** — top-level element of a modal component. Props: `children`*, `title`, `subtitle`, `size: 'medium'|'xlarge'|'fullscreen'`, `returnValue`, `submit` (Button).

## Interactivity recipes

### Button → action → state → re-render

```tsx
<button label="Click me" onPress={{ action: 'update-state', anotherProperty: 'something' }} />
```

```tsx
async action(element, action) {
    switch (action.action) {
        case 'update-state':
            return { state: { content: action.anotherProperty } };
        default:
            return {};
    }
}
```

Arbitrary extra keys on the action object arrive on `action` in the reducer — use them to parameterize a shared handler.

### Reading inputs

Inputs don't dispatch on each keystroke. `<textinput state="content" />` stores its value so that when some *other* action fires (a submit button), it's available as `element.state.content`.

### Dynamic binding (synchronous updates)

The action loop is asynchronous; for live-preview UX bind elements directly with `element.dynamicState('<key>')`:

```tsx
async render(element) {
    return (
        <block>
            <hstack>
                <textinput state="content" />
                <divider />
                <webframe
                    source={{ url: environment.integration.urls.publicEndpoint + '/iframe.html' }}
                    data={{ content: element.dynamicState('content') }}
                />
            </hstack>
        </block>
    );
}
```

Inside the iframe, values arrive via the `message` event:

```js
window.addEventListener('message', (event) => {
    if (event.data) {
        const content = event.data.state.content;
    }
});
```

### Webframe → integration communication

The frame posts actions back to the parent:

```js
window.parent.postMessage({ action: { type: 'doSomething' } }, '*');
```

Send `@webframe.ready` when the frame is ready to receive data, and `@webframe.resize` to fit content.

### Editable blocks (persisting user edits)

State is ephemeral — to persist an edit into the document, copy state into props:

```tsx
<block>
    <textinput state="content" />
    <button
        label="Save"
        onPress={{
            action: '@editor.node.updateProps',
            props: { content: element.dynamicState('content') },
        }}
    />
</block>
```

### Modals

Open: dispatch `@ui.modal.open` with the modal component's `componentId` and props. The modal component renders a `<modal>` root. Close from inside with `@ui.modal.close` and an optional `returnValue`, which lands in the parent component's action handler.

### Link unfurling

Most links unfurl automatically via iFramely; build a custom unfurler only when that fails or you want a richer block. Three pieces:

1. Manifest: the block lists URL patterns —

   ```yaml
   blocks:
       - id: unfurl-example
         title: Unfurl Block
         urlUnfurl:
           - https://myapp.com/
   ```

2. The component handles `@link.unfurl`, typically converting the URL into props:

   ```tsx
   async action(element, action) {
       switch (action.action) {
           case '@link.unfurl':
               return { props: { url: action.url } };
       }
       return element;
   }
   ```

3. `render` displays it (parse ids/params out of the URL for API lookups, handle not-found/private links gracefully):

   ```tsx
   async render(element) {
       return (
           <block>
               <webframe source={{ url: element.props.url }} aspectRatio={16 / 9} />
           </block>
       );
   }
   ```

### Markdown serialization of blocks

To make a block round-trip through Git Sync as a readable code fence instead of an opaque node, add `markdown: { codeblock, body }` to its manifest entry — see `manifest.md`. The native Mermaid block uses this pattern.
