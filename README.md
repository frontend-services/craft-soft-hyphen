# Soft Hyphen for Craft CMS

Adds a soft hyphen (`&shy;`) button to CKEditor in Craft CMS.

Soft hyphens are invisible characters that hint the browser where it can break a word across lines. When the break happens, a hyphen is shown. Useful for long words in narrow columns or responsive layouts.

## Requirements

- Craft CMS 4.0+
- CKEditor plugin 4.0+

## Installation
```bash
composer require frontend-services/craft-soft-hyphen
php craft plugin/install soft-hyphen
```

That's it. The plugin works immediately — the keyboard shortcut **Ctrl+Shift+−** is available in every CKEditor field.

## Adding the toolbar button

To give editors a clickable button:

1. Go to **Settings → CKEditor** and open your config
2. Drag **Soft Hyphen** into your toolbar
3. Save

## How it works

The plugin automatically injects itself into every CKEditor instance. No config pasting required.

In the editor, soft hyphens are shown as a visible dashed marker so editors can see and manage them. The saved HTML contains `<span class="shy">­</span>` — the `­` inside is a real soft hyphen character that the browser handles natively.

No frontend JavaScript or template changes needed.

| Layer | What happens |
|-------|-------------|
| Editor | Visible dashed marker so editors can spot them |
| Database | `<span class="shy">­</span>` |
| HTML Purifier | Plugin whitelists the span automatically |
| Frontend | Browser uses the `­` character natively |

## Keyboard shortcut

**Ctrl+Shift+−** inserts a soft hyphen at the cursor position.