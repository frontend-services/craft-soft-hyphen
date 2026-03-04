(function () {
  'use strict';

  const softHyphenIcon =
    '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="2" y="8.5" width="7" height="3" rx="1.5" fill="currentColor"/>' +
      '<rect x="11" y="8.5" width="7" height="3" rx="1.5" fill="currentColor" opacity="0.25"/>' +
    '</svg>';

  const nbspIcon =
    '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="2" y="4" width="16" height="12" rx="3" fill="currentColor" opacity="0.12"/>' +
      '<text x="10" y="13.5" font-size="8.5" font-weight="bold" fill="currentColor" text-anchor="middle" font-family="sans-serif" opacity="0.85">NB</text>' +
    '</svg>';

  /**
   * Create a small icon button that inserts a character at the cursor position
   * of the given <input> or <textarea>.
   *
   * @param {string} iconSvg   SVG markup for the button icon
   * @param {string} title     Tooltip / accessible label
   * @param {string} char      Character to insert (e.g. '\u00AD')
   * @param {HTMLElement} inputEl  The target input/textarea
   * @returns {HTMLButtonElement}
   */
  function createInsertButton(iconSvg, title, char, inputEl) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fs-plain-insert-btn';
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.innerHTML = iconSvg;

    btn.addEventListener('mousedown', function (e) {
      // Prevent the input from losing focus
      e.preventDefault();
    });

    btn.addEventListener('click', function () {
      const start = inputEl.selectionStart ?? inputEl.value.length;
      const end   = inputEl.selectionEnd   ?? inputEl.value.length;
      const before = inputEl.value.slice(0, start);
      const after  = inputEl.value.slice(end);

      inputEl.value = before + char + after;

      // Restore cursor position
      const pos = start + char.length;
      inputEl.setSelectionRange(pos, pos);

      // Notify Craft / Garnish that the value changed
      inputEl.dispatchEvent(new Event('input',  { bubbles: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      inputEl.focus();
    });

    return btn;
  }

  /**
   * Initialise all wrappers that the PHP side rendered.
   * Each wrapper has class "fs-plain-shy-wrap" and a data attribute
   * "data-input-id" pointing to the real text input/textarea id.
   */
  function initWrappers() {
    document.querySelectorAll('.fs-plain-shy-wrap:not([data-fs-init])').forEach(function (wrap) {
      wrap.setAttribute('data-fs-init', '1');

      const inputId = wrap.dataset.inputId;
      if (!inputId) return;

      // The actual input may be inside the wrapper already, find by id
      const inputEl = document.getElementById(inputId);
      if (!inputEl) return;

      const btnBar = wrap.querySelector('.fs-plain-shy-buttons');
      if (!btnBar) return;

      btnBar.appendChild(createInsertButton(softHyphenIcon, 'Soft Hyphen (&shy;)', '\u00B7', inputEl));
      btnBar.appendChild(createInsertButton(nbspIcon,       'Non-Breaking Space (&nbsp;)', '\u2423', inputEl));
    });
  }

  // Run on DOM-ready and also after Craft loads new content (e.g. element editor slideouts)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWrappers);
  } else {
    initWrappers();
  }

  // Re-run when Craft injects new HTML (element editor, quick-post, etc.)
  if (typeof Garnish !== 'undefined') {
    Garnish.on(Garnish.Base, 'init', initWrappers);
  }

  // Also observe DOM mutations for dynamically injected content
  const observer = new MutationObserver(function (mutations) {
    let needsInit = false;
    for (const m of mutations) {
      if (m.addedNodes.length) { needsInit = true; break; }
    }
    if (needsInit) initWrappers();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Expose for external use / re-init
  window.FsSoftHyphenPlainText = { init: initWrappers };
})();

