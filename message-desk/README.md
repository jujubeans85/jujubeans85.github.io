# Message Desk

The iPhone reads one date-keyed JSON dictionary per person. If today's local date is missing, its existing If block skips Send Message. The sender phone owns the contact and clock. The private control page owns frequency, day pattern and the selected conversation. Only the finished messages, dates and an opaque preparation receipt go into this repository.

## Prepare a feed

Run `node message-desk/engine.mjs input.json` with Node 22 or newer. Input stays in a temporary workspace. The returned `feed` and `receipt` are the only publishing outputs. The array `planned` is diagnostic. Use Australia/Sydney dates. Obtain current private profile settings on every run. Do not put topics, conversation URLs, transcripts, contact details or the input file in git.

The input contains `profile` (id, start_date, frequency 0–7, shuffle_days and revision), `existing` (the current date dictionary), `previousReceipt` (null on first publication), `sourceTag` (a stable opaque hex digest for the source selection), and `candidates` (an array of complete, unique send-ready strings, including any sign-off). Optional `today` is for reproducible tests. Resolve chat sources in the owner's private context, then compose original messages suitable to publish. An explicit chat that is unavailable is a missing source: do not invent a match.

Keep a source tag stable for the same settings/source revision and selected conversation. Mark a material change by hashing the recipient, source revision and stable private conversation identifier or version with SHA-256. Never publish the original identifier. For initial Chloe continuity, the first verified conversation is the 28 October 2026 nursing-quotes discussion, with the countdown collection as fallback. Reuse the existing receipt tag while that is still the selected source. When previewing missing slots use an empty candidates array first. Repeating a successful run with the same inputs needs no commit.

Use `feedPath(profile.id)` for the phone output. Its address is fixed, including Chloe’s historical `clobo/chlo-sms-by-date.json`. Store the receipt at `message-desk/receipts/<id>.json`. Read both at the same branch head and commit them together with an expected-head lease. Re-read on a race. An unfilled slot stays out of the phone feed; a missed day is never replayed. Paused profiles remove pending post-start dates. Historical countdown notes remain intact. A prepared entry is not a delivery receipt.

A new recipient has an opaque ID and their own feed. Duplicate the date-checking Shortcut, change its feed URL and choose the contact on the sender phone. Keep the previous recipient's automation in place. Each phone automation controls its own time. No SMS credentials are used here.
