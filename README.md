# Soft Hyphen for Craft CMS

Adds **soft hyphen** (`&shy;`) and **non-breaking space** (`&nbsp;`) buttons to CKEditor in Craft CMS.

- **Soft hyphens** are invisible characters that hint the browser where it can break a word across lines. When the break happens, a hyphen is shown. Useful for long words in narrow columns or responsive layouts.
- **Non-breaking spaces** prevent line breaks between two words. Useful for keeping units together (e.g. "100 km") or after short prepositions.


## Requirements

- Craft CMS 4.0+
- CKEditor plugin 4.0+

## Installation
```bash
composer require frontend-services/craft-soft-hyphen
php craft plugin/install soft-hyphen
```

That's it. The plugin works immediately.

## Adding the toolbar button

To give editors a clickable button:

1. Go to **Settings → CKEditor** and open your config
2. Drag **Soft Hyphen** and/or **Non-Breaking Space** into your toolbar
3. Save

## How it works

The plugin automatically injects itself into every CKEditor instance. No config pasting required.

In the editor, both characters are shown as visible markers so editors can see and manage them. On the frontend, the markers are automatically replaced with real `&shy;` and `&nbsp;` characters.

No frontend JavaScript or template changes needed.
