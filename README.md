# Clearing

A thirty-day experiment in looking closely at alcohol. Mobile-first, installable PWA. No build step, no backend, no paid APIs.

## Deploy

**GitHub Pages:** push this folder to a repo, then Settings → Pages → deploy from branch (root). 
**Vercel:** `vercel deploy` from this folder, or drag the folder into the Vercel dashboard. No framework preset needed.

HTTPS is needed for install and offline mode (both hosts provide it).

## Files

- `index.html`: app shell
- `styles.css`: design system (oat, moss, espresso, terracotta; Newsreader + Hanken Grotesk)
- `content.js`: the curriculum: 30 days, belief library, craving tools, references, Australian support services
- `app.js`: views, flows, storage, insights
- `sw.js`: offline cache. **Bump `VERSION` whenever you change any file.**
- `manifest.webmanifest`, `icons/`

## Data and privacy

All data lives in `localStorage` under `clearing.v1` on the user's device. Users can export (JSON), import, print a report and delete everything from **You**.

To add accounts and sync later, replace `LocalAdapter` in `app.js` (an object with `read`, `write` and `clear`) with an adapter that talks to authenticated storage. Records already carry ids and timestamps, and `updatedAt` is stamped on every save.

## Testing a given day

In the browser console: `__clearing.setToday('2026-12-10')` to simulate a date. `__clearing.setToday()` to clear it.

## Before a public launch

- Have a GP or alcohol and other drug clinician review the safety screening and lesson content.
- Check the support numbers in `content.js` (verified November 2026).
- Check the name "Clearing" for trademark conflicts in your market.
