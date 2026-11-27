(() => {
  'use strict';

  const storageKey = 'hit-the-road-juice-v1';
  let installPrompt;
  let saving = false;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
  });

  async function install() {
    if (installPrompt) {
      const prompt = installPrompt;
      installPrompt = null;
      await prompt.prompt();
      return;
    }
    const dialog = document.getElementById('install-dialog');
    if (!dialog || dialog.open) return;
    const onlineURL = document.documentElement.dataset.onlinePlanner;
    if (selfContained && onlineURL) {
      const firstParagraph = dialog.querySelector('p');
      const link = document.createElement('a');
      link.href = onlineURL;
      link.textContent = 'Open the online planner';
      if (firstParagraph) firstParagraph.replaceChildren(link, ' in Safari, tap Share, then Add to Home Screen.');
    }
    dialog.showModal();
  }

  const selfContained = document.documentElement.hasAttribute('data-juice-snapshot');
  if (!selfContained && 'serviceWorker' in navigator && window.isSecureContext && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(() => navigator.serviceWorker.ready)
      .then(registration => {
        if (registration.scope === new URL('./', location.href).href) {
          document.documentElement.dataset.offline = 'ready';
        }
      })
      .catch(() => { /* The planner also runs without an installed offline cache. */ });
  }

  function readPreferences() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch { /* Restricted storage on some file viewers. */ }
    return window.JUICE_SNAPSHOT || {};
  }

  async function getResponse(url) {
    const response = await fetch(url);
    if (!response.ok) throw Error('Could not read ' + new URL(url).pathname.split('/').pop());
    return response;
  }

  function asDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async function createSnapshot(preferences) {
    const base = new URL('./index.html', document.baseURI);
    const snapshot = selfContained
      ? document.cloneNode(true)
      : new DOMParser().parseFromString(await (await getResponse(base)).text(), 'text/html');
    const root = snapshot.documentElement;
    root.dataset.juiceSnapshot = '';
    if (!selfContained) root.dataset.onlinePlanner = new URL('./', document.baseURI).href;
    root.dataset.offline = 'ready';
    snapshot.querySelectorAll('[data-backup-remove], script[data-snapshot-prefs], link[rel~="manifest"], link[rel~="icon"], link[rel~="apple-touch-icon"], link[rel~="preload"]').forEach(el => el.remove());
    snapshot.querySelectorAll('dialog[open]').forEach(dialog => dialog.removeAttribute('open'));

    const assets = new Map();
    function embed(url, relativeTo) {
      if (/^(data:|#)/i.test(url)) return url;
      const absolute = new URL(url, relativeTo).href;
      if (!assets.has(absolute)) assets.set(absolute, getResponse(absolute).then(r => r.blob()).then(asDataURL));
      return assets.get(absolute);
    }

    async function embedCSS(css, relativeTo) {
      const references = [...css.matchAll(/url\(\s*(['"]?)([^)'"]+)\1\s*\)/gi)];
      const replacements = await Promise.all(references.map(match => embed(match[2].trim(), relativeTo)));
      for (let i = references.length - 1; i >= 0; i--) {
        const reference = references[i];
        css = css.slice(0, reference.index) + 'url("' + replacements[i] + '")' +
          css.slice(reference.index + reference[0].length);
      }
      return css;
    }

    if (!selfContained) {
      await Promise.all([
        ...[...snapshot.querySelectorAll('link[rel="stylesheet"]')].map(async link => {
          const cssURL = new URL(link.getAttribute('href'), base);
          const style = snapshot.createElement('style');
          if (link.media) style.media = link.media;
          style.textContent = await embedCSS(await (await getResponse(cssURL)).text(), cssURL);
          link.replaceWith(style);
        }),
        ...[...snapshot.querySelectorAll('style')].map(async style => {
          style.textContent = await embedCSS(style.textContent, base);
        }),
        ...[...snapshot.querySelectorAll('[style*="url("]')].map(async el => {
          el.setAttribute('style', await embedCSS(el.getAttribute('style'), base));
        }),
        ...[...snapshot.querySelectorAll('img[src]')].map(async img => {
          img.setAttribute('src', await embed(img.getAttribute('src'), base));
        })
      ]);
      const scripts = [...snapshot.querySelectorAll('script[src]')];
      const sources = await Promise.all(scripts.map(el => getResponse(new URL(el.getAttribute('src'), base)).then(r => r.text())));
      scripts.forEach((el, i) => {
        const inline = snapshot.createElement('script');
        inline.textContent = sources[i].replace(/<\/script/gi, '<\\/script');
        el.remove();
        snapshot.body.appendChild(inline);
      });
    }

    const saved = snapshot.createElement('script');
    saved.dataset.snapshotPrefs = '';
    saved.textContent = 'window.JUICE_SNAPSHOT=' + JSON.stringify(preferences || {}).replace(/</g, '\\u003c') + ';';
    snapshot.head.prepend(saved);
    return new Blob(['<!doctype html>\n', root.outerHTML], { type: 'text/html;charset=utf-8' });
  }

  async function backup(preferences = readPreferences()) {
    if (saving) return false;
    saving = true;
    try {
      const blob = await createSnapshot(preferences);
      const objectURL = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectURL;
      a.download = 'Hit-The-Road-Juice.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectURL), 60000);
      return true;
    } catch (error) {
      window.alert('Couldn’t save the offline copy. Reopen the planner online and try again.');
      return false;
    } finally {
      saving = false;
    }
  }

  window.JuiceOffline = { install, backup };
})();
