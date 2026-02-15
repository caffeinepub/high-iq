# Specification

## Summary
**Goal:** Make the “High IQ” website installable as a Progressive Web App in Chrome (desktop + Android) and prepare assets/documentation for Chrome Web Store submission.

**Planned changes:**
- Add a valid web app manifest (name “High IQ”, start_url, display: "standalone", theme/background colors aligned to the current warm theme) and wire it into `frontend/index.html` with required manifest/icon metadata.
- Add a Chrome-suitable app icon set (including at least 192x192 and 512x512 PNGs) as static assets and reference them from the manifest.
- Add and register a service worker that caches the app shell (landing page + core JS/CSS) for basic offline launch, with graceful UI behavior when live data is unavailable.
- Add a short “Chrome install / publish” documentation file describing local install, packaging the build for distribution, and Chrome Web Store submission steps (noting what can’t be automated).

**User-visible outcome:** Users can install “High IQ” from Chrome’s install prompt and launch it in a standalone app window, with basic offline support; the repo includes icons and docs needed to package and submit the PWA to the Chrome Web Store.
