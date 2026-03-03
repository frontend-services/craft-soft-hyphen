(function () {
  'use strict';

  const { Plugin, ButtonView } = CKEditor5.core || {};
  const ui = CKEditor5.ui || {};
  const BV = ButtonView || ui.ButtonView;

  class SoftHyphenEditing extends (Plugin || Object) {
    static get pluginName() {
      return 'SoftHyphenEditing';
    }

    init() {
      const editor = this.editor;

      // Schema
      editor.model.schema.register('softHyphen', {
        allowWhere: '$text',
        isInline: true,
        isObject: true,
      });

      // Editing view — visible placeholder
      editor.conversion.for('editingDowncast').elementToElement({
        model: 'softHyphen',
        view: (modelElement, { writer }) => {
          return writer.createRawElement('span', { class: 'shy' }, function(domElement) {
            domElement.textContent = '\u002D';
          });
        },
      });

      // Data view — saved to DB
      editor.conversion.for('dataDowncast').elementToElement({
        model: 'softHyphen',
        view: (modelElement, { writer }) => {
          const span = writer.createContainerElement('span', { class: 'shy' });
          const text = writer.createText('\u00AD');
          writer.insert(writer.createPositionAt(span, 0), text);
          return span;
        },
      });

      // Upcast — loading saved content
      editor.conversion.for('upcast').elementToElement({
        view: { name: 'span', classes: 'shy' },
        model: 'softHyphen',
      });

      // Command
      editor.commands.add('insertSoftHyphen', {
        execute() {
          editor.model.change((writer) => {
            const el = writer.createElement('softHyphen');
            editor.model.insertContent(el);
            writer.setSelection(el, 'after');
          });
        },
      });

      // Keyboard shortcut
      editor.keystrokes.set('Ctrl+Shift+-', (data, cancel) => {
        editor.execute('insertSoftHyphen');
        cancel();
      });
    }
  }

  // SVG icon: a dashed hyphen
  const softHyphenIcon =
    '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="2" y="8.5" width="7" height="3" rx="1.5" fill="currentColor"/>' +
      '<rect x="11" y="8.5" width="7" height="3" rx="1.5" fill="currentColor" opacity="0.25"/>' +
    '</svg>';

  class SoftHyphenUI extends (Plugin || Object) {
    static get pluginName() {
      return 'SoftHyphenUI';
    }

    init() {
      const editor = this.editor;

      editor.ui.componentFactory.add('softHyphen', () => {
        const button = new BV();
        button.set({
          label: 'Soft Hyphen',
          icon: softHyphenIcon,
          tooltip: true,
        });

        button.on('execute', () => {
          editor.execute('insertSoftHyphen');
          editor.editing.view.focus();
        });

        return button;
      });
    }
  }

  class SoftHyphen extends (Plugin || Object) {
    static get pluginName() {
      return 'SoftHyphen';
    }

    static get requires() {
      return [SoftHyphenEditing, SoftHyphenUI];
    }
  }

  // Register as DLL-compatible CKEditor 5 plugin
  CKEditor5.softHyphen = { SoftHyphen, SoftHyphenEditing, SoftHyphenUI };
})();