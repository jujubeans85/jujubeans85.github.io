# Dan’s Next Stop

A standalone Point Clare travel companion for Dan.

Live app: https://jujubeans85.github.io/ios/dans-next-stop/

iPhone: open the live app in Safari → Share → Add to Home Screen → keep Open as Web App on, if shown → Add.

## Source of truth

This folder is the maintained application. No build step or dependencies. GitHub Pages serves these files directly. The earlier ChatGPT Site is a previous preview, not the source for future changes.

- index.html: UI, route data and local preferences.
- manifest.webmanifest: relative app identity and scope, isolated to this folder.
- sw.js: app-shell offline cache; first successful online load required.
- icon-192.png / icon-512.png: home-screen icons.

Favourites remain on the device. No analytics, account or server storage. Download a backup copy from the app to preserve favourites.

Times are planning estimates, not live ETAs or a ten-minute accuracy guarantee. Original research date: 30 October 2026. Unknown pins and untimed connections remain labelled.

## Updating

Edit this folder, check JavaScript syntax and phone layout, then push main. Increment the service-worker cache version for every app-shell update. Keep manifest scope relative to avoid taking over other apps on this domain.
