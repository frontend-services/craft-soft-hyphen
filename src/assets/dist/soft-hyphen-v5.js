/**
 * Soft Hyphen & Non-Breaking Space — CKEditor plugin (CKEditor Craft plugin ≥ v5)
 *
 * ES module loaded via the Craft CKEditor import map.
 * Imports Plugin and ButtonView from the "ckeditor5" specifier which resolves
 * to the bundled CKEditor 5 library via the import map shim.
 *
 * Each character is stored as a styled <span> in the DB and replaced with the
 * real Unicode character on the frontend via Plugin.php's page-template event.
 *
 * SoftHyphen and NonBreakingSpace are exported individually so editors can add
 * them to a toolbar one at a time.
 */

import { Plugin, ButtonView } from 'ckeditor5';

// ── Icons ─────────────────────────────────────────────────────────────────────

const softHyphenIcon =
  '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
  '<rect x="2" y="8.5" width="7" height="3" rx="1.5" fill="currentColor"/>' +
  '<rect x="11" y="8.5" width="7" height="3" rx="1.5" fill="currentColor" opacity="0.25"/>' +
  '</svg>';

const nbspIcon =
  '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
  '<rect x="2" y="4" width="16" height="12" rx="3" fill="currentColor" opacity="0.12"/>' +
  '<text x="10" y="13.5" font-size="8.5" font-weight="bold" fill="currentColor"' +
  ' text-anchor="middle" font-family="sans-serif" opacity="0.85">NB</text>' +
  '</svg>';

// ── Editing plugin factory ────────────────────────────────────────────────────
// Creates a Plugin subclass that:
//   - registers a model element (inline object)
//   - editing downcast → visible styled <span> with a proxy label
//   - data downcast    → bare <span class="..."> (PHP strips it to the real char on frontend)
//   - upcast           → recognises the saved <span> coming back from DB
//   - adds a command that inserts the element at the cursor

function makeEditingPlugin(pluginName, modelName, spanClass, proxyLabel) {
  return class extends Plugin {
    static get pluginName() { return pluginName + 'Editing'; }

    init() {
      const editor = this.editor;

      // $inlineObject already implies isInline, isObject, allowWhere: '$text'
      editor.model.schema.register(modelName, {
        inheritAllFrom: '$inlineObject',
      });

      // Editing view: visible badge the editor sees
      editor.conversion.for('editingDowncast').elementToElement({
        model: modelName,
        view: (modelElement, { writer }) => {
          const span = writer.createContainerElement('span', { class: spanClass });
          writer.insert(
            writer.createPositionAt(span, 0),
            writer.createText(proxyLabel),
          );
          return span;
        },
      });

      // Data view: bare span — PHP regex strips it to the real Unicode char on the frontend
      editor.conversion.for('dataDowncast').elementToElement({
        model: modelName,
        view: (modelElement, { writer }) =>
          writer.createContainerElement('span', { class: spanClass }),
      });

      // Upcast: read the saved span back from the DB
      editor.conversion.for('upcast').elementToElement({
        view: {
          name: 'span',
          classes: [ spanClass ],
        },
        model: modelName,
      });

      // Command
      editor.commands.add('insert' + pluginName, {
        execute() {
          editor.model.change((writer) => {
            const el = writer.createElement(modelName);
            editor.model.insertContent(el);
            writer.setSelection(el, 'after');
          });
        },
      });
    }
  };
}

// ── UI plugin factory ─────────────────────────────────────────────────────────

function makeUIPlugin(pluginName, buttonName, label, icon) {
  return class extends Plugin {
    static get pluginName() { return pluginName + 'UI'; }

    init() {
      const editor = this.editor;
      const commandName = 'insert' + pluginName;

      editor.ui.componentFactory.add(buttonName, () => {
        const button = new ButtonView();
        button.set({ label, icon, tooltip: true });
        button.on('execute', () => {
          editor.execute(commandName);
          editor.editing.view.focus();
        });
        return button;
      });
    }
  };
}

// ── Combined plugin factory ───────────────────────────────────────────────────

function makePlugin(pluginName, modelName, spanClass, proxyLabel, buttonName, label, icon) {
  const EditingPlugin = makeEditingPlugin(pluginName, modelName, spanClass, proxyLabel);
  const UIPlugin = makeUIPlugin(pluginName, buttonName, label, icon);

  return class extends Plugin {
    static get pluginName() { return pluginName; }
    static get requires() { return [EditingPlugin, UIPlugin]; }
  };
}

// ── Exported plugins ──────────────────────────────────────────────────────────

export const SoftHyphen = makePlugin(
  'SoftHyphen',
  'softHyphen',
  'fs-shy',
  '\u00B7',       // middle dot — visible proxy in the editor
  'softHyphen',
  'Soft Hyphen',
  softHyphenIcon,
);

export const NonBreakingSpace = makePlugin(
  'NonBreakingSpace',
  'nonBreakingSpace',
  'fs-nbsp',
  '\u2423',       // open box ␣ — visible proxy in the editor
  'nonBreakingSpace',
  'Non-Breaking Space',
  nbspIcon,
);

