(() => {
  'use strict';

  const eventStart = Date.parse('2026-11-16T00:00:00+11:00');
  const archivedAt = eventStart + 24 * 60 * 60 * 1000;
  const label = document.getElementById('countdown-label');
  const values = document.getElementById('countdown-values');
  const message = document.getElementById('countdown-message');
  const parts = {
    hours: document.getElementById('count-hours'),
    minutes: document.getElementById('count-minutes'),
    seconds: document.getElementById('count-seconds')
  };

  function updateCountdown() {
    const now = Date.now();
    const remaining = Math.max(0, eventStart - now);
    if (remaining === 0) {
      values.hidden = true;
      message.hidden = false;
      label.textContent = now >= archivedAt ? 'THE INVITATION · 16 NOVEMBER 2026' : 'MONDAY 16 NOVEMBER · 00:00 AEDT';
      message.textContent = now >= archivedAt ? 'A midnight to remember.' : 'Midnight has arrived.';
      return;
    }
    const totalSeconds = Math.floor(remaining / 1000);
    parts.hours.textContent = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    parts.minutes.textContent = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
    parts.seconds.textContent = String(totalSeconds % 60).padStart(2, '0');
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const shareButton = document.getElementById('share-invitation');
  const shareStatus = document.getElementById('share-status');
  const shareFallback = document.getElementById('share-fallback');
  const shareInput = document.getElementById('share-url');
  const invitationUrl = new URL(window.location.href);
  invitationUrl.hash = '';
  invitationUrl.search = '';

  async function copyInvitationLink() {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(invitationUrl.href);
        shareStatus.textContent = 'Invitation link copied. Keep it close.';
        return;
      } catch (_) {
        // Offer an ordinary selectable link if clipboard access is unavailable.
      }
    }
    shareFallback.hidden = false;
    shareInput.value = invitationUrl.href;
    shareInput.focus();
    shareInput.select();
    shareStatus.textContent = 'Select and copy the invitation link below.';
  }

  shareButton.addEventListener('click', async () => {
    shareStatus.textContent = '';
    shareFallback.hidden = true;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'CLUB 2263 — After dark. By invitation.',
          text: 'Midnight · Monday 16 November 2026 · Sydney time. 18+. Confirm with the person who invited you.',
          url: invitationUrl.href
        });
        shareStatus.textContent = 'Invitation shared.';
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') {
          shareStatus.textContent = 'Your invitation is still here.';
          return;
        }
      }
    }
    await copyInvitationLink();
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeLightbox = lightbox.querySelector('.lightbox-close');
  let previousFocus = null;

  function clearLightbox() {
    document.body.classList.remove('lightbox-active');
    lightboxImage.removeAttribute('src');
    if (previousFocus) previousFocus.focus();
  }

  function dismissLightbox() {
    if (typeof lightbox.close === 'function') lightbox.close();
    else {
      lightbox.removeAttribute('open');
      clearLightbox();
    }
  }

  document.querySelectorAll('.gallery-open').forEach(button => {
    button.addEventListener('click', () => {
      previousFocus = button;
      lightboxImage.src = button.dataset.image;
      lightboxImage.alt = button.querySelector('img').alt;
      lightboxCaption.textContent = button.dataset.caption;
      if (typeof lightbox.showModal === 'function') lightbox.showModal();
      else lightbox.setAttribute('open', '');
      document.body.classList.add('lightbox-active');
      closeLightbox.focus();
    });
  });

  closeLightbox.addEventListener('click', dismissLightbox);
  lightbox.addEventListener('close', clearLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox || event.target.classList.contains('lightbox-inner')) dismissLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightbox.hasAttribute('open')) dismissLightbox();
  });
})();
