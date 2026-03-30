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

  // ── Floating widget ───────────────────────────────────────────────────────

  const widget = document.createElement('div');
  widget.className = 'fs-shy-widget';
  widget.style.display = 'none';

  let activeInput = null;
  let hideTimeout = null;

  function createButton(iconSvg, title, char) {
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
      if (!activeInput) return;

      const start = activeInput.selectionStart ?? activeInput.value.length;
      const end   = activeInput.selectionEnd   ?? activeInput.value.length;
      const before = activeInput.value.slice(0, start);
      const after  = activeInput.value.slice(end);

      activeInput.value = before + char + after;

      const pos = start + char.length;
      activeInput.setSelectionRange(pos, pos);

      activeInput.dispatchEvent(new Event('input',  { bubbles: true }));
      activeInput.dispatchEvent(new Event('change', { bubbles: true }));
      activeInput.focus();
    });

    return btn;
  }

  widget.appendChild(createButton(softHyphenIcon, 'Soft Hyphen (&shy;)',        '\u00B7'));
  widget.appendChild(createButton(nbspIcon,        'Non-Breaking Space (&nbsp;)', '\u2423'));

  document.body.appendChild(widget);

  // ── Positioning ───────────────────────────────────────────────────────────

  function positionWidget(inputEl) {
    const rect  = inputEl.getBoundingClientRect();
    const wRect = widget.getBoundingClientRect();
    const vW    = window.innerWidth;
    const vH    = window.innerHeight;
    const GAP   = 8;
    const EDGE  = 4;

    // Prefer right side, fall back to left
    let left = rect.right + GAP;
    if (left + wRect.width > vW - EDGE) {
      left = rect.left - wRect.width - GAP;
    }
    left = Math.max(EDGE, Math.min(left, vW - wRect.width - EDGE));

    // Align top of widget with top of input, clamp vertically
    let top = rect.top;
    top = Math.max(EDGE, Math.min(top, vH - wRect.height - EDGE));

    widget.style.left = left + 'px';
    widget.style.top  = top  + 'px';
  }

  function showWidget(inputEl) {
    if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
    activeInput = inputEl;
    widget.style.display = 'flex';
    positionWidget(inputEl);
  }

  function hideWidget() {
    activeInput = null;
    widget.style.display = 'none';
  }

  // ── Field wiring ──────────────────────────────────────────────────────────

  function attachToInput(inputEl) {
    if (inputEl.dataset.fsShyAttached) return;
    inputEl.dataset.fsShyAttached = '1';

    inputEl.addEventListener('focus', function () { showWidget(inputEl); });

    inputEl.addEventListener('blur', function () {
      hideTimeout = setTimeout(hideWidget, 150);
    });
  }

  function initFields() {
    document.querySelectorAll('[data-fs-shy-field]:not([data-fs-shy-attached])').forEach(attachToInput);
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFields);
  } else {
    initFields();
  }

  if (typeof Garnish !== 'undefined') {
    Garnish.on(Garnish.Base, 'init', initFields);
  }

  const observer = new MutationObserver(function (mutations) {
    for (const m of mutations) {
      if (m.addedNodes.length) { initFields(); break; }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Reposition when viewport changes
  window.addEventListener('scroll', function () {
    if (activeInput) positionWidget(activeInput);
  }, { passive: true });

  window.addEventListener('resize', function () {
    if (activeInput) positionWidget(activeInput);
  }, { passive: true });

  window.FsSoftHyphenPlainText = { init: initFields };
})();
