(() => {
  'use strict';

  const page = document.getElementById('gift-page');
  const box = document.getElementById('gift-box');
  const intro = document.getElementById('gift-intro');
  const introCopy = document.getElementById('intro-copy');
  const seal = document.getElementById('break-seal');
  const unwrapAction = document.getElementById('unwrap-action');
  const unwrapButton = document.getElementById('unwrap-gift');
  const reveal = document.getElementById('gift-reveal');
  const revealTitle = document.getElementById('reveal-title');
  const wrappingFooter = document.getElementById('wrapping-footer');
  const hint = document.getElementById('gift-hint');
  const softNote = document.getElementById('soft-note');
  const status = document.getElementById('gift-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let stage = 'sealed';
  let openingTimer = null;
  let pointerStart = null;

  function setStage(next) {
    stage = next;
    page.dataset.stage = next;
  }

  function breakSeal() {
    if (stage !== 'sealed') return;
    setStage('loosened');
    seal.disabled = true;
    seal.setAttribute('aria-hidden', 'true');
    unwrapAction.hidden = false;
    hint.textContent = 'THE SEAL IS BROKEN';
    introCopy.textContent = 'A little closer. A little more curious.';
    softNote.textContent = 'Pull the ribbon. Let the night out.';
    status.textContent = 'The seal is open. Tap Unwrap your gift, or swipe the wrapping sideways.';
    unwrapButton.focus({ preventScroll: true });
  }

  function finishOpening() {
    window.clearTimeout(openingTimer);
    openingTimer = null;
    setStage('revealed');
    box.setAttribute('aria-hidden', 'true');
    reveal.inert = false;
    reveal.removeAttribute('aria-hidden');
    intro.hidden = true;
    status.textContent = 'Your gift is unwrapped. Your CLUB 2263 invitation is ready.';
    revealTitle.focus({ preventScroll: true });
    page.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  function openGift(skipAnimation = false) {
    if (stage === 'opening' || stage === 'revealed') return;
    seal.disabled = true;
    unwrapButton.disabled = true;
    unwrapAction.hidden = true;
    wrappingFooter.hidden = true;
    reveal.hidden = false;
    reveal.inert = true;
    reveal.setAttribute('aria-hidden', 'true');
    if (skipAnimation || reducedMotion.matches) {
      finishOpening();
      return;
    }
    setStage('opening');
    status.textContent = 'Unwrapping your gift.';
    openingTimer = window.setTimeout(finishOpening, 1050);
  }

  function wrapAgain() {
    window.clearTimeout(openingTimer);
    openingTimer = null;
    pointerStart = null;
    shareStatus.textContent = '';
    shareFallback.hidden = true;
    reveal.hidden = true;
    reveal.inert = true;
    reveal.setAttribute('aria-hidden', 'true');
    intro.hidden = false;
    box.removeAttribute('aria-hidden');
    unwrapAction.hidden = true;
    wrappingFooter.hidden = false;
    seal.disabled = false;
    seal.removeAttribute('aria-hidden');
    unwrapButton.disabled = false;
    hint.textContent = 'TAP THE SEAL';
    softNote.textContent = 'Take your time. It’s yours to open.';
    introCopy.textContent = 'Some things are better unwrapped.';
    setStage('sealed');
    status.textContent = 'Your gift is wrapped again. Tap the seal to open it.';
    seal.focus({ preventScroll: true });
    page.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  seal.addEventListener('click', breakSeal);
  unwrapButton.addEventListener('click', () => openGift(false));
  document.getElementById('skip-wrapping').addEventListener('click', () => openGift(true));
  document.getElementById('wrap-again').addEventListener('click', wrapAgain);

  // A sideways gesture is a convenience; every action is also a normal button.
  box.addEventListener('pointerdown', event => {
    if (stage !== 'loosened' || event.target.closest('button') || !event.isPrimary) return;
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    if (box.setPointerCapture) box.setPointerCapture(event.pointerId);
  });
  box.addEventListener('pointerup', event => {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;
    const dx = Math.abs(event.clientX - pointerStart.x);
    const dy = Math.abs(event.clientY - pointerStart.y);
    pointerStart = null;
    if (dx >= 48 && dx > dy * 1.35) openGift(false);
  });
  box.addEventListener('pointercancel', () => { pointerStart = null; });
  box.addEventListener('lostpointercapture', () => { pointerStart = null; });

  const invitationImage = document.getElementById('invitation-image');
  function showInvitationFallback() {
    invitationImage.hidden = true;
    document.getElementById('invitation-fallback').hidden = false;
  }
  invitationImage.addEventListener('error', showInvitationFallback);
  if (invitationImage.complete && invitationImage.naturalWidth === 0) showInvitationFallback();

  const shareButton = document.getElementById('share-gift');
  const shareStatus = document.getElementById('share-status');
  const shareFallback = document.getElementById('share-fallback');
  const shareInput = document.getElementById('share-url');
  const giftUrl = new URL(window.location.href);
  giftUrl.hash = '';
  giftUrl.search = '';
  giftUrl.pathname = giftUrl.pathname.replace(/\/index\.html$/, '/');

  async function copyGiftLink() {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(giftUrl.href);
        shareStatus.textContent = 'Gift link copied. It opens wrapped for its next visitor.';
        return;
      } catch (_) {
        // Keep sharing possible when browser clipboard access is unavailable.
      }
    }
    shareFallback.hidden = false;
    shareInput.value = giftUrl.href;
    shareInput.focus();
    shareInput.select();
    shareStatus.textContent = 'Copy the gift link below.';
  }

  shareButton.addEventListener('click', async () => {
    shareStatus.textContent = '';
    shareFallback.hidden = true;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url: giftUrl.href });
        shareStatus.textContent = 'Your gift is ready for its next unwrapping.';
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') {
          shareStatus.textContent = 'Your gift is still here.';
          return;
        }
      }
    }
    await copyGiftLink();
  });

  // No storage, query flag or hash remembers an unwrapped state.
  // A fresh visit always starts with the seal intact.
})();
