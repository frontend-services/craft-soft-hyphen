/**
 * Soft Hyphen & Non-Breaking Space — CKEditor plugin (CKEditor Craft plugin v4)
 **/

(function () {
  'use strict';

  const { Plugin, ButtonView } = CKEditor5.core || {};
  const ui = CKEditor5.ui || {};
  const BV = ButtonView || ui.ButtonView;

  // =========================================================================
  // Soft Hyphen
  // =========================================================================

  class SoftHyphenEditing extends (Plugin || Object) {
    static get pluginName() {
      return 'SoftHyphenEditing';
    }

    init() {
      const editor = this.editor;

      editor.model.schema.register('softHyphen', {
        allowWhere: '$text',
        isInline: true,
        isObject: true,
      });

      editor.conversion.for('editingDowncast').elementToElement({
        model: 'softHyphen',
        view: (modelElement, { writer }) => {
          return writer.createRawElement('span', { class: 'fs-shy' }, function(domElement) {
            domElement.textContent = '\u002D';
          });
        },
      });

      editor.conversion.for('dataDowncast').elementToElement({
        model: 'softHyphen',
        view: (modelElement, { writer }) => {
          return writer.createContainerElement('span', { class: 'fs-shy' });
        },
      });

      editor.conversion.for('upcast').elementToElement({
        view: { name: 'span', classes: 'fs-shy' },
        model: 'softHyphen',
      });

      editor.commands.add('insertSoftHyphen', {
        execute() {
          editor.model.change((writer) => {
            const el = writer.createElement('softHyphen');
            editor.model.insertContent(el);
            writer.setSelection(el, 'after');
          });
        },
      });
    }
  }

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

  // =========================================================================
  // Non-Breaking Space
  // =========================================================================

  class NonBreakingSpaceEditing extends (Plugin || Object) {
    static get pluginName() {
      return 'NonBreakingSpaceEditing';
    }

    init() {
      const editor = this.editor;

      editor.model.schema.register('nonBreakingSpace', {
        allowWhere: '$text',
        isInline: true,
        isObject: true,
      });

      editor.conversion.for('editingDowncast').elementToElement({
        model: 'nonBreakingSpace',
        view: (modelElement, { writer }) => {
          return writer.createRawElement('span', { class: 'fs-nbsp' }, function(domElement) {
            domElement.textContent = '\u00A0';
          });
        },
      });

      editor.conversion.for('dataDowncast').elementToElement({
        model: 'nonBreakingSpace',
        view: (modelElement, { writer }) => {
          return writer.createContainerElement('span', { class: 'fs-nbsp' });
        },
      });

      editor.conversion.for('upcast').elementToElement({
        view: { name: 'span', classes: 'fs-nbsp' },
        model: 'nonBreakingSpace',
      });

      editor.commands.add('insertNonBreakingSpace', {
        execute() {
          editor.model.change((writer) => {
            const el = writer.createElement('nonBreakingSpace');
            editor.model.insertContent(el);
            writer.setSelection(el, 'after');
          });
        },
      });
    }
  }

  const nonBreakingSpaceIcon =
    '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="2" y="4" width="16" height="12" rx="3" fill="currentColor" opacity="0.12"/>' +
      '<text x="10" y="13.5" font-size="8.5" font-weight="bold" fill="currentColor" text-anchor="middle" font-family="sans-serif" opacity="0.85">NB</text>' +
    '</svg>';

  class NonBreakingSpaceUI extends (Plugin || Object) {
    static get pluginName() {
      return 'NonBreakingSpaceUI';
    }

    init() {
      const editor = this.editor;

      editor.ui.componentFactory.add('nonBreakingSpace', () => {
        const button = new BV();
        button.set({
          label: 'Non-Breaking Space',
          icon: nonBreakingSpaceIcon,
          tooltip: true,
        });

        button.on('execute', () => {
          editor.execute('insertNonBreakingSpace');
          editor.editing.view.focus();
        });

        return button;
      });
    }
  }

  class NonBreakingSpace extends (Plugin || Object) {
    static get pluginName() {
      return 'NonBreakingSpace';
    }

    static get requires() {
      return [NonBreakingSpaceEditing, NonBreakingSpaceUI];
    }
  }

  // Register both plugins (guard against double-loading in modals)
  if (!CKEditor5.softHyphen) {
    CKEditor5.softHyphen = { SoftHyphen, SoftHyphenEditing, SoftHyphenUI };
  }
  if (!CKEditor5.nonBreakingSpace) {
    CKEditor5.nonBreakingSpace = { NonBreakingSpace, NonBreakingSpaceEditing, NonBreakingSpaceUI };
  }
})();