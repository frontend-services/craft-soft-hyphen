# Soft Hyphen Changelog

## 1.1.4 — 2026-03-30

- Make the buttons floating on the right side of the field
- Improved compatibility with CKEditor 4
- Fixed slug generator to exclude soft hyphen proxy characters

## 1.1.3.2 — 2026-03-05

### Fixed
- Fixed dynamic addition of CKEditor field in matrix

## 1.1.3.1 — 2026-03-05

### Fixed
- Fixed "Identifier 'SoftHyphen' has already been declared" console error when multiple CKEditor fields are present on the same page.

## 1.1.3 — 2026-03-05

### Fixed
- Compatibility with CKEditor V5 plugin

## 1.1.2 — 2026-03-05

### Fixed
- Uninstalling the plugin no longer breaks the site. A `beforeUninstall` hook now removes the `softHyphenButtons` setting from all Plain Text field records in the database before the plugin is removed, so Craft can load those fields normally afterwards.

## 1.1.1 — 2026-03-04

### Fixed
- Title field buttons now also appear when the title field is configured as a textarea (Craft CMS 5.x allows switching the title field to a multiline textarea).

## 1.1.0 — 2026-03-04

### Added
- **Title field support** — a new plugin-level setting ("Settings → Soft Hyphen → Title field buttons") enables soft hyphen and NBSP insert buttons next to the entry title field.
- Plugin settings page (`hasCpSettings`).

### Fixed
- Field input ID is now resolved via `namespaceInputId()` to correctly match the actual rendered element ID when fields are inside namespaced contexts (e.g. element editor slideouts).

## 1.0.0

### Added
- **CKEditor support** — injects soft hyphen (`&shy;`) and non-breaking space (`&nbsp;`) toolbar buttons into every CKEditor instance. Characters are stored as visible `<span>` markers in the database and replaced with real `\u00AD` / `\u00A0` on frontend page render.
- **Plain Text field support** — per-field toggle ("Soft Hyphen / NBSP buttons") in Plain Text field settings. Renders two insert buttons next to the input in the entry editor.
- Proxy character display: because `&shy;` and `&nbsp;` are invisible in plain inputs, the plugin shows them as `·` (middle dot, `\u00B7`) and `␣` (open box, `\u2423`) while editing. These are converted back to the real invisible characters server-side on save via `Field::EVENT_BEFORE_ELEMENT_SAVE`, so the database always stores the correct values.

