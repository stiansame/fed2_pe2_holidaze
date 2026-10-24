# Venue browser checks

Run `npm run dev`, then open the addresses below using the local URL shown by Vite.
These fixtures render the real application with a memory router and simulated venue responses.
They do not call Noroff, use a saved session or change external data. No additional dependencies are needed.
They are manual browser checks, separate from the automated `npm test` suite, and are not included in the production build.

## Repeat the checks

1. Open `/tests/browser/venues.html?path=/venues&mode=data` at 320, 390 and 1440px viewport widths.
   Check for horizontal scrolling, readable cards, wrapped filters and all four amenity pills.
2. Check that 15 of 18 stays appear. Select **Load more**: all 18 should appear and the button should disappear.
3. Enter two search characters, then `Test stay 1`. Check the minimum-length hint, automatic search and nine matches.
   On mobile, open **Filters**, then select WiFi and **Name: Z–A**. Close and reopen the panel: choices should remain selected and its button should show the active count.
   Open a card and return. Search, sorting and filters should be preserved.
4. Set Guests to 100. Check the empty-results message, then reset filters.
5. Open `/tests/browser/venues.html?path=/venues/test-0&mode=data`.
   Check the long name and fallbacks for missing photos, description, amenities, location, capacity, price and host.
   There should be no map for missing coordinates.
6. Open the same address with `test-1`: its photo and avatar fail to load.
   Open **View all photos**. Check the image fallback, separate close/arrow controls and photo counter.
   Use arrow keys, then Escape. Focus should return to the gallery opener.
   The second image is deliberately small; its controls must remain usable too.
7. Open `test-2`. Check long unbroken description, host and location text without horizontal scrolling.
8. Open `/tests/browser/venues.html?path=/&mode=data`.
   Check the still hero photo, slogan, prominent search and six highly rated cards below it.
   On the live home page, reload several times: the hero chooses one random photo from the highly rated pool on each visit and stays still while typing or waiting.
   Use `mode=broken` to check the fixed reserve photo when the selected venue image fails. `mode=empty` and API failures also retain the reserve photo and search.
   Search with an empty field, fewer than three characters and a valid query. The empty field opens all venues; a short query is rejected; a valid query is preserved in the results.
9. Repeat `/`, `/venues` and `/venues/test-1` with `mode=error`, then `mode=network`.
   Each page should show an error and **Try again**. Retry should load its content successfully.
10. Use `mode=empty` for `/` and `/venues`. Check explanatory text and navigation.
    Open `/tests/browser/venues.html?path=/venues/missing&mode=data`: check the venue-not-found message and return link.
11. Repeat normal navigation with live data at `/`. Check a real venue gallery, host and map.
    On mobile, open Menu; Escape should close it and return focus to Menu.

## Recorded result — 2026-10-24

- Passed: fixture home, list and detail layouts at 320, 390 and 1440px. Page scroll width matches available width.
- Passed: 15/18 pagination, search threshold and automatic results, filters, sorting, empty results and preserved return state.
- Passed: missing and failed images/avatar, missing venue fields, long unbroken text, invalid/default map coordinates and 404.
- Passed: simulated HTTP 503 and network failure/retry on home, list and detail pages.
- Passed: gallery arrows/Escape/focus return and mobile-menu Escape/focus return.
- Passed: live API home, venue search and Mountain Cabin details, gallery and OpenStreetMap embed.
- Passed: 22 automated tests, lint and production build.

Fixed: forced minimum body width causing scrolling with desktop scrollbars at 320px;
clipped long hero locations; overlapping gallery controls for failed/tiny images;
blank location/host values consisting only of whitespace.

Scope: local Chromium viewport simulation and deterministic fixtures, supplemented with live API checks.
This is not a physical-device or cross-browser certification. Full accessibility/regression work remains in later packages.

## Static hero and compact filters — 2026-10-24

- Home chooses one random photo from the already loaded highly rated venues and keeps it still during the visit. A fixed reserve photo handles missing/failed images. No carousel controls, timers or extra venue requests for hero content remain.
- Mobile filters start collapsed, show the active count and retain selections while closed. Guests and sorting share a row; amenities use two columns. Desktop controls stay visible.
- README now focuses on setup, stack, commands, deployment and project/design links.
