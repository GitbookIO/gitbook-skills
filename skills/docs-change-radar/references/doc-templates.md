# Default doc shapes

Use these only when the site has no templates of its own, and never against the team's style guide: where the guide says how a heading or a how-to is written, the guide wins. An existing page or section of the same kind is always a better template than anything here.

Name the shape in the plan and show its outline before writing. Block syntax is in `write-docs`.

| The change adds or alters | Shape |
| --- | --- |
| Something an existing page partly covers | New section on that page |
| A name, option, or behavior being retired | Deprecation notice |
| A task a reader can now do, or does differently | How-to |
| An idea or behavior a reader must understand | Concept |
| Settings, fields, limits, endpoints, commands | Reference |
| A known failure and its fix | Troubleshooting |
| Something worth announcing | Changelog entry, as well as the above |

Most changes need an edit to an existing page and sometimes a changelog entry. A new page is the exception.

## New section on an existing page

Copy the nearest section of the same kind on that page: heading level, opening sentence, list, or code pattern, where hints sit.

```markdown
### <Heading in the same form as sibling headings>

<One or two sentences: what this is and when it applies.>

<The same body pattern as the sibling: steps, a value list, a code block.>
```

Then check the page's opening paragraph and any list of what the page covers; a new section often needs a mention there.

## Deprecation notice

Put it where the old thing is documented. If it never was, put it in the section for its replacement, so the old name stays findable.

```markdown
{% hint style="warning" %}
`<old name>` is deprecated. Use [`<new name>`](<link>) instead.
{% endhint %}
```

Add what happens to existing uses, or a removal date, only if the source states it. "Deprecated" does not mean "removed".

## How-to

```markdown
---
description: "<What the reader will have done by the end>"
---

# <Verb the object>

<What this does and when you would do it.>

## Before you start

- <Plan, role, or permission required>

## <Verb the object>

{% stepper %}
{% step %}
### <Action>
<What to do, with exact UI labels, and what the reader then sees.>
{% endstep %}
{% endstepper %}

## Next steps

- [<Related task>](<path>.md)
```

Use a stepper for three or more steps, a numbered list for fewer. Put a limit or gotcha at the step where it bites.

## Concept

```markdown
# <Noun>

<What it is and the problem it solves.>

## How it works

## When to use it

## Related
```

## Reference

```markdown
# <Thing> reference

| <Name> | <Type or values> | <Default> | <Description> |
| --- | --- | --- | --- |
```

For API endpoints, update the OpenAPI spec (`write-openapi`); do not hand-write reference pages.

## Troubleshooting

```markdown
## <The symptom, or the exact error text>

**Cause**: <Why it happens.>

**Fix**: <What to do.>
```

Add it to the feature's existing troubleshooting section.

## Changelog entry

```markdown
{% update date="<YYYY-MM-DD>" %}
## <What is new, in the reader's terms>

<What changed and what it lets you do.> [Read more](<path>.md)
{% endupdate %}
```

Use the form the site's changelog already uses. Date it with the day the change reaches readers. Do not announce something still behind a flag.
