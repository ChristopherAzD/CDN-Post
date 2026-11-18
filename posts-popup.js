(function () {
  'use strict';

  var script = document.currentScript;
  var apiUrl = script && script.getAttribute('data-api');
  if (!apiUrl) {
    console.error('Posts popup: missing data-api on the script.');
    return;
  }

  var styles = `
    .ww-post-popup[hidden]{display:none!important}
    .ww-post-popup{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(3,8,17,.72);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
    .ww-post-popup__panel{box-sizing:border-box;display:flex;flex-direction:column;width:min(100%,720px);max-height:94vh;padding:10px;border:1px solid rgba(255,255,255,.22);border-radius:19px;background:rgba(23,31,46,.78);color:#f8fafc;box-shadow:0 24px 70px rgba(0,0,0,.34),inset 0 1px rgba(255,255,255,.12);backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%)}
    .ww-post-popup__panel:focus{outline:none}
    .ww-post-popup__head,.ww-post-popup__controls{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .ww-post-popup__head{min-height:30px;margin:0 2px 8px 8px}
    .ww-post-popup__title{display:flex;align-items:center;gap:8px;margin:0;color:#f8fafc;font-size:11px;font-weight:750;letter-spacing:.16em;text-transform:uppercase}
    .ww-post-popup__title:before{content:"";width:6px;height:6px;border-radius:50%;background:#edc56b;box-shadow:0 0 12px rgba(237,197,107,.6)}
    .ww-post-popup__close{display:grid;place-items:center;width:30px;height:30px;border:1px solid rgba(255,255,255,.18);border-radius:50%;background:rgba(255,255,255,.08);color:#f8fafc;font-size:21px;line-height:1;cursor:pointer;transition:background .2s,border-color .2s}
    .ww-post-popup__close:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.35)}
    .ww-post-popup__image{display:block;min-height:0;max-height:77vh;width:100%;border-radius:11px;object-fit:contain;background:rgba(0,0,0,.16)}
    .ww-post-popup__controls{margin:9px 4px 1px}
    .ww-post-popup__count{color:rgba(255,255,255,.75);font-size:12px;font-weight:600;letter-spacing:.1em;white-space:nowrap}
    .ww-post-popup__nav{border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(255,255,255,.09);color:#f8fafc;padding:7px 13px;font:600 12px system-ui,sans-serif;cursor:pointer;transition:background .2s,border-color .2s}
    .ww-post-popup__nav:hover{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.35)}
    .ww-post-popup button:focus-visible{outline:2px solid #edc56b;outline-offset:3px}
    @media(max-width:480px){.ww-post-popup{padding:8px}.ww-post-popup__panel{padding:7px;border-radius:15px}.ww-post-popup__head{margin:0 2px 6px 7px}.ww-post-popup__image{max-height:76vh;border-radius:9px}.ww-post-popup__nav{padding:7px 10px}}
  `;

  function element(tag, className, text) {
    var node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function init(posts) {
    var images = posts.filter(function (post) {
      return typeof post.postImageUrl === 'string' && post.postImageUrl.trim();
    });
    if (!images.length) return;

    var style = element('style', '');
    style.textContent = styles;
    document.head.appendChild(style);

    var overlay = element('div', 'ww-post-popup');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Featured posts');
    var panel = element('div', 'ww-post-popup__panel');
    panel.tabIndex = -1;
    var head = element('div', 'ww-post-popup__head');
    var title = element('h2', 'ww-post-popup__title', 'Featured posts');
    var closeButton = element('button', 'ww-post-popup__close', '×');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close posts');
    head.append(title, closeButton);

    var image = element('img', 'ww-post-popup__image');
    var controls = element('div', 'ww-post-popup__controls');
    var previous = element('button', 'ww-post-popup__nav', '‹ Previous');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Previous post');
    var count = element('span', 'ww-post-popup__count');
    count.setAttribute('aria-live', 'polite');
    var next = element('button', 'ww-post-popup__nav', 'Next ›');
    next.type = 'button';
    next.setAttribute('aria-label', 'Next post');
    controls.append(previous, count, next);
    panel.append(head, image);
    if (images.length > 1) panel.appendChild(controls);
    overlay.appendChild(panel);

    var index = 0;
    var oldOverflow = document.body.style.overflow;
    var oldFocus = document.activeElement;

    function render() {
      var post = images[index];
      image.src = post.postImageUrl;
      image.alt = post.category || 'Post ' + (index + 1);
      count.textContent = (index + 1) + ' / ' + images.length;
    }
    function goTo(nextIndex) {
      index = (nextIndex + images.length) % images.length;
      render();
    }
    function close() {
      document.removeEventListener('keydown', onKeyDown);
      overlay.remove();
      style.remove();
      document.body.style.overflow = oldOverflow;
      if (oldFocus && oldFocus.isConnected && oldFocus.focus) oldFocus.focus();
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') close();
      if (images.length > 1 && event.key === 'ArrowLeft') goTo(index - 1);
      if (images.length > 1 && event.key === 'ArrowRight') goTo(index + 1);
      if (event.key === 'Tab') {
        var last = images.length > 1 ? next : closeButton;
        if (event.shiftKey && (document.activeElement === closeButton || document.activeElement === panel)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          closeButton.focus();
        }
      }
    }

    closeButton.addEventListener('click', close);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) close();
    });
    previous.addEventListener('click', function () { goTo(index - 1); });
    next.addEventListener('click', function () { goTo(index + 1); });
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    render();
    panel.focus();
  }

  function load() {
    try {
      var url = new URL(apiUrl);
      if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
        throw new Error('The API must use HTTPS.');
      }
      fetch(url.href, { cache: 'no-store' })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function (data) { init(Array.isArray(data.posts) ? data.posts : []); })
        .catch(function (error) { console.error('Posts popup:', error); });
    } catch (error) {
      console.error('Posts popup:', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
})();
