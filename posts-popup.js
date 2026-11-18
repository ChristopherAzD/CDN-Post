(function () {
  'use strict';

  var script = document.currentScript;
  var apiUrl = script && script.getAttribute('data-api');
  if (!apiUrl) {
    console.error('Posts popup: falta data-api en el script.');
    return;
  }

  var styles = '\
    .ww-post-popup[hidden]{display:none!important}\
    .ww-post-popup{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.84);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}\
    .ww-post-popup__panel{box-sizing:border-box;display:flex;flex-direction:column;width:min(100%,850px);max-height:94vh;padding:16px;border-radius:16px;background:#fff;color:#172033;box-shadow:0 24px 80px rgba(0,0,0,.4)}\
    .ww-post-popup__head,.ww-post-popup__controls{display:flex;align-items:center;justify-content:space-between;gap:12px}\
    .ww-post-popup__head{margin-bottom:12px}.ww-post-popup__title{margin:0;font-size:18px;font-weight:700}\
    .ww-post-popup__close{border:0;background:transparent;color:inherit;font-size:30px;line-height:1;cursor:pointer}\
    .ww-post-popup__image{display:block;min-height:0;max-height:74vh;width:100%;object-fit:contain}\
    .ww-post-popup__controls{margin-top:14px}.ww-post-popup__count{font-size:14px;white-space:nowrap}\
    .ww-post-popup__nav{border:0;border-radius:8px;background:#172033;color:#fff;padding:10px 14px;font:600 14px system-ui,sans-serif;cursor:pointer}\
    .ww-post-popup__nav:hover{background:#354865}\
    .ww-post-popup button:focus-visible{outline:3px solid #e6b629;outline-offset:2px}\
    @media(max-width:480px){.ww-post-popup__panel{padding:12px}.ww-post-popup__nav{padding:9px 10px}}';

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
    overlay.setAttribute('aria-label', 'Publicaciones');
    var panel = element('div', 'ww-post-popup__panel');
    var head = element('div', 'ww-post-popup__head');
    var title = element('h2', 'ww-post-popup__title', 'Publicaciones');
    var closeButton = element('button', 'ww-post-popup__close', '×');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Cerrar publicaciones');
    head.append(title, closeButton);

    var image = element('img', 'ww-post-popup__image');
    var controls = element('div', 'ww-post-popup__controls');
    var previous = element('button', 'ww-post-popup__nav', '‹ Anterior');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Publicación anterior');
    var count = element('span', 'ww-post-popup__count');
    count.setAttribute('aria-live', 'polite');
    var next = element('button', 'ww-post-popup__nav', 'Siguiente ›');
    next.type = 'button';
    next.setAttribute('aria-label', 'Publicación siguiente');
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
      image.alt = post.category || 'Publicación ' + (index + 1);
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
        if (event.shiftKey && document.activeElement === closeButton) {
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
    closeButton.focus();
  }

  function load() {
    try {
      var url = new URL(apiUrl);
      if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
        throw new Error('El API debe usar HTTPS.');
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
