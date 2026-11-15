# CLUB 2263 — Your platinum hour

A self-contained, phone-first VIP scene using the six supplied photographs,
restyled in candlelit oxblood and aged brass. The primary experience is `live/`;
the root `index.html` redirects there and supplies matching share metadata.
The existing wrapped invitation in `gift/` is preserved.

## Fixed event and cutoff

- Original arrival: midnight at the end of Sunday 15 November 2026.
- **Doors close strictly at 02:00 Monday 16 November 2026, Australia/Sydney (AEDT).**
- Cutoff instant: `2026-11-16T02:00:00+11:00`, or `2026-11-15T15:00:00Z`.
- Adults 18+, by invitation. Arrival details come through the inviter.

`live/event-config.js` is the single source for the live deadline, alert
milestones, image/word sequence, audio path and initial volume. The countdown
uses the fixed timestamp and the current clock; it clamps at zero and changes
to **DOORS CLOSED**. It never rolls over to another night. Update the visible
HTML date, share artwork and metadata alongside that configuration before
reusing this for a different event.

## Live experience

The splash announces that **JUiCE has gifted you a platinum VIP PASS**, with
late entry and special attention on arrival, valid only until the stated cutoff.
Accepting the pass reveals a single-screen scene: photographs fade through
curated positions, separate faint words provide clinical-comic asides, and the
countdown remains foregrounded.

- `live/index.html`, `live/live.css`, `live/live.js`: splash, scene and controls.
- `live/event-config.js`: central configuration and pure timing helpers.
- `live/vip-preview.png` and `.svg`: matching platinum-pass share artwork.
- `assets/*.webp`: all six previously restyled photos, reused without changes.
- `audio/vip-afterhours-loop.mp3`: the processed supplied recording.

Controls cover sound, pause/resume scene and sharing the current pass URL.
Quiet entry is available. Reduced motion, keyboard focus, native buttons,
clipboard/selectable-link sharing fallbacks and a no-JavaScript destination
are included. Nothing is sent automatically. There are no external script
libraries, accounts, recipient tracking or payment flows.

### Sound and reminders on iPhone

Audio starts from the entry tap, with a soft initial volume. iPhone playback
requires that user gesture; playback failures leave a usable Sound control.
Entering quietly and muting are supported.

Reminders are **in-page notices** every ten minutes until ten minutes remain,
then every two minutes: 01:10, 01:20, 01:30, 01:40, 01:50, 01:52, 01:54,
01:56, 01:58 and the 02:00 closure, all Sydney time. They state the time left;
soft chimes respect the sound control. Returning to the page recalculates from
the clock and collapses missed milestones into one current notice.

**Keep the page open for time alerts.** This release does not provide guaranteed
background or lock-screen notifications. It does not install a push service or
request notification permission. A 02:00 alarm in the iPhone Clock app is a
separate optional backup. The old `club2263.ics` describes the original midnight
arrival; it is not the live cutoff-reminder system.

The exported loop is 16.489 seconds, approximately 331 KB, measured at
−18.44 LUFS and −4.08 dBTP. It keeps the recorded source with a subtle slowdown,
warmer tone, restrained stereo reflections and a repeat-boundary crossfade.
See `docs/audio-provenance.json` for source identity, exact processing settings
and measurements. Decode and signal checks passed; the audio record explicitly
notes that no direct listening interface was available for an ear-based audit.

## Public sharing and deployment

Intended VIP share URL: <https://x-club-2263.netlify.app/live/>.
Existing wrapped gift: <https://x-club-2263.netlify.app/gift/>.
Original invitation: <https://x-club-2263.netlify.app/invite.svg>.

The existing **x-club-2263** Netlify project uses manual drop deployment.
**This new platinum live-page release is prepared as a Netlify ZIP and has not
yet been published to that project.** The earlier wrapped-gift deployment was
confirmed ready under deploy `6af995fca93cc9a6f1728c54`; that does not publish
this newer live scene.

Unzip the new complete-site bundle, open the existing project's **Deploys**
page and upload the extracted folder containing `index.html` directly at its
root. Deploy the full bundle, including `live/`, `audio/`, `assets/` and `gift/`.
No install, build command or application server is required. `_headers` and
`netlify.toml` carry static hosting configuration.

Dashboard: <https://app.netlify.com/projects/x-club-2263>.
Official manual-upload instructions:
<https://docs.netlify.com/deploy/create-deploys/#drag-and-drop>.

Source remains `jujubeans85/jujubeans85.github.io`, branch `main`, directory
`club-2263/`. A source update on GitHub does **not** automatically deploy this
manual Netlify project. Preserve unrelated repository content. Verify the new
Netlify deployment before announcing its live route. Use the Netlify URL for
recipient-facing sharing: Messages displays the domain of the link sent.

A link preview is artwork and metadata; custom gift/scene interactions run
after opening the webpage. The existing `gift/` still opens with its seal,
unwrapping, replay and original invitation. Wrapping, noindex and private-event
styling provide atmosphere, not authentication or a one-time access token.

## Development and provenance

Run `npm run dev` (Python 3 required) for local preview and `npm run check` for
JavaScript syntax checks. Test the fixed cutoff, notification boundaries,
return-from-background behaviour, phone layout, sound/mute, pause and sharing.
Report physical-device and live-host access limits accurately.

`asset-provenance.json` records the original photo names and image-edit prompts.
`tools/render-invitation.py` preserves the original SVG invitation authoring.
The original invitation exports and earlier browser proofs remain in the
project. The supplied message screenshot was context, not a public scene image.

All CLUB 2263 copy and graphics are original; no affiliation with reference
venues is implied. The original visual research used the historical Hellfire
organiser listing (<https://ra.co/events/8323>), first-person Hellfire history
(<https://headon.org.au/exhibitions/people-hellfire/>), Studio Kink/KARNAL
(<https://www.studiokink.com/karnal>) and Eagle Sydney
(<https://www.eaglesydney.com.au/>). Those references establish no current
performers, prices, facilities or services for CLUB 2263.
