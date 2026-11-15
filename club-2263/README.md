# CLUB 2263 — After dark. By invitation.

A self-contained static event teaser with six original supplied photographs
restyled into one candlelit, oxblood and aged-brass visual treatment.

## Event

- Start: **12:00 am Monday 16 November 2026, Australia/Sydney (AEDT)**.
- This is midnight at the end of Sunday 15 November.
- UTC instant: `2026-11-15T13:00:00Z`.
- Adults 18+, by invitation. Confirmation and arrival details come through the inviter.
- No street address, attendee list, ticketing or RSVP database is published.
- The page is a public teaser. Search noindex and an invitation theme do not provide authentication.

## Files and behaviour

- `index.html`, `styles.css`, `app.js`: complete responsive website, no remote dependencies.
- `assets/*.webp`: all six restyled source images, about 867 KB combined.
- `invite.svg`: self-contained 1080 × 1600 invitation; photograph embedded, typography outlined.
- `invite.png`: same artwork for phone sharing.
- `og-image.png`: 1200 × 630 link preview.
- `club2263.ics`: start-only calendar event; no invented end time.
- `asset-provenance.json`: original filenames and image-edit prompts.
- `tools/render-invitation.py`: reproducible vector invitation authoring.
- `gift/`: a phone-first wrapped invitation, with sealed link-preview artwork.

The countdown stops at zero, changes to “Midnight has arrived”, then uses an
archive message after 24 hours. Gallery photographs open in a keyboard-accessible
dialog. The share button shares the wrapped gift URL through the device share
sheet, with clipboard and selectable-link fallbacks. Nothing is sent automatically.

## Wrapped gift for Messages

Share <https://jujubeans85.github.io/club-2263/gift/>.

The recipient sees sealed burgundy-and-brass artwork in a supported link preview.
Opening the link presents a wax seal: tap to loosen the ribbon, then tap the unwrap
button or swipe sideways to reveal the invitation. The reveal links to the exact
live invitation at <https://x-club-2263.netlify.app/invite.svg>.

There is a direct-open alternative, keyboard focus handling, reduced-motion
support, an image-error fallback, and a no-JavaScript link. Each visit starts
wrapped; the replay button resets the experience. There are no accounts,
cookies, recipient tracking, payments or dependencies on external scripts.

Messages does not run custom JavaScript inside an ordinary link-preview bubble.
The interactive unwrapping happens on the web page after the recipient opens it.
No app installation is required. Preview rendering depends on the receiving
Messages app. Browser testing covered the mobile layout, seal, reveal, skip,
replay and share fallback; no physical iPhone Messages session was tested.

Apple reference: <https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages>.

The wrapping is a visual surprise, not authentication or a one-time access token.
Sharing only the gift URL keeps the event details out of the message caption.

Preview assets in `gift/`: `gift-preview.png` / `.svg` are 1200 × 630;
`gift-preview-vertical.png` / `.svg` are 1080 × 1350. SVG type is outlined and the
artwork is self-contained. The raster apple-touch icon is 180 × 180.

## Source and GitHub Pages

Canonical source directory: `jujubeans85/jujubeans85.github.io`, branch `main`,
`club-2263/`.

Page URL: <https://jujubeans85.github.io/club-2263/>.

Existing repository files outside this directory are preserved. The event date
is fixed; update the HTML, countdown instant, calendar, invitation generator and
social metadata together before reusing this for another night.

## Netlify deployment

The existing **x-club-2263** site is live at
<https://x-club-2263.netlify.app/>. Its original uploaded deployment was verified
on 15 November 2026 (deploy `6af9909c7c365b19556b47c4`). It is a drop deployment,
so a GitHub commit does not automatically update it.

Project dashboard: <https://app.netlify.com/projects/x-club-2263>

**The new gift route still needs the updated bundle uploaded to Netlify.**
This workspace's Netlify dashboard access is blocked and its connected tools
do not expose deploy uploads. The GitHub Pages gift is available independently.

For a manual update, unzip `CLUB_2263_Unwrap_Netlify.zip`, open this existing
project's **Deploys** page, and upload the extracted `CLUB_2263_Unwrap_Netlify`
folder to the deploy dropzone. This is the complete site, including the gift;
`index.html` is directly inside that folder. No install, build command or server
is needed. `_headers` carries the static response rules. The Netlify bundle's
canonical and Open Graph URLs already target `x-club-2263.netlify.app`.
Official instructions: <https://docs.netlify.com/deploy/create-deploys/#drag-and-drop>.

For Git continuous deployment, connect this GitHub repository, use branch `main`,
base directory `club-2263`, and publish directory `.`. Leave the build command
empty. The supplied `netlify.toml` defines the static publish directory.

After the new Netlify upload, the gift route will be `/gift/` on that site. Keep
sharing the working GitHub Pages gift until the Netlify gift route is verified.
For a future switch to continuous deployment, update source canonical/OG URLs
to the chosen primary host. The share controls use the current host at runtime.

`.netlify/` and environment files are ignored by Git. No credentials are included.

## Local preview

Run `npm run dev` (requires Python 3), or `python3 dev-server.py --port 3000`.
Run `npm run check` for the JavaScript syntax check.

The invitation renderer is optional authoring tooling. Regenerating the artwork
requires Python fontTools and Pillow, Node sharp, and the font paths documented
in the script. The exported website needs none of those packages to run.

## Preview

![Desktop layout](docs/preview-desktop.jpg)

[Phone layout](docs/preview-mobile.jpg)

[Wrapped gift on a phone layout](docs/gift-wrapped-phone.jpg)

[Revealed invitation on a phone layout](docs/gift-reveal-phone.jpg)

## Creative references

Research informed the atmosphere-first structure, visible event time, private
arrival details and concise consent notes. All CLUB 2263 copy and graphics are
original; no affiliation is implied.

- Historical Hellfire organiser listing: <https://ra.co/events/8323>
- First-person Hellfire history (closed December 2019):
  <https://headon.org.au/exhibitions/people-hellfire/>
- Studio Kink / KARNAL page structure: <https://www.studiokink.com/karnal>
- Eagle Sydney event-first presentation: <https://www.eaglesydney.com.au/>

KARNAL is used as a design reference, not a claim that an old schedule or venue
is current. No other venue's performers, ticket prices, services or facilities
are represented as CLUB 2263's.

The uploaded screen recording was reviewed as context and is not part of the
public page. The six photographs are represented by their restyled derivatives.
