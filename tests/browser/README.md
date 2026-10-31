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

## Availability calendar — 2026-10-30

Open `/tests/browser/venues.html?path=/venues/test-1&mode=data`.
Fixture bookings cover three nights, from today + 3 days until checkout on today + 6 days.

- Browse months: past months cannot be opened; past dates are grey, crossed out and disabled. Booked nights have a pale red background.
- Click a free date for check-in, then a later date for checkout. The selected stay has a pale green background and its dates appear below the calendar; no date inputs remain.
- Dates that would make the stay span a booked night are disabled, even when the endpoint itself is free.
- Check a stay ending on the existing check-in date or starting on its checkout date: it is allowed.
- Click an earlier date while selecting checkout to replace check-in. Click a free date after completing a range to start a new selection. Repeat across a month boundary.
- Reserve stays disabled until both dates are selected. Guest counts outside 1–6 are rejected.
- Reserve opens the protected review page; logged-out visitors must log in first. The selection is preserved in the URL.
- Change the selection or guest count after checking: the previous result disappears.
- Use `mode=availability-missing`: availability must not be presented as free when bookings are absent.
- Repeat at 320, 390 and desktop widths, including keyboard navigation.

Recorded: click selection, Enter/Space, new selection, month boundary, blocked overlap, checkout boundary, capacity constraint and responsive widths passed in local Chromium. Date arithmetic, invalid dates, capacity and boundary cases are also covered by the automated availability test.

Regression check: legacy bookings with equal/reversed dates wholly in the past no longer hide the calendar. Invalid upcoming bookings retain known booked nights but disable availability confirmation and show a warning. Verified against live Ice Hotel, Picnic Blanket and The Old Well data; Ice Hotel marks 1–7 November 2026 as booked and 8 November as available. 24 automated tests, lint and build pass.

## Static hero and compact filters — 2026-10-24

- Home chooses one random photo from the already loaded highly rated venues and keeps it still during the visit. A fixed reserve photo handles missing/failed images. No carousel controls, timers or extra venue requests for hero content remain.
- Mobile filters start collapsed, show the active count and retain selections while closed. Guests and sorting share a row; amenities use two columns. Desktop controls stay visible.
- README now focuses on setup, stack, commands, deployment and project/design links.

## Booking review and confirmation — package #19

Open `/tests/browser/venues.html?path=%2Fvenues%2Ftest-1%2Freserve%3Ffrom%3D2090-03-25%26to%3D2090-03-28%26guests%3D2&signedIn=1`.
The fixture uses in-memory authentication and bookings. All requests are intercepted; it never reads the real saved session or writes to Noroff. Reloading the entire fixture resets its saved bookings.

1. Review: 25–28 March 2090, 2 guests, 3 nights, NOK 1,490/night and NOK 4,470 estimated total.
2. Back to dates: dates and guest count remain selected. Reserve returns to review.
3. Confirm (also try a double-click): the saved fixture booking opens a confirmation with reference, dates and guests. View venue returns to fresh availability.
4. Remove `signedIn=1`: enter `fixture@stud.noroff.no` and any password. Login must return to the same review with the selection intact.
5. Add `mode=booking-price`: the first confirmation updates the price to NOK 1,600/night, total NOK 4,800, and requires a second confirmation before saving.
6. Add `mode=booking-conflict`: the final availability check detects overlap and stops the POST.
7. Add `mode=booking-error`: a rejected POST shows its API message. No success screen appears.
8. Add `mode=booking-uncertain`: a response is lost after saving; a warning appears and resubmission stays disabled.
9. Add `mode=booking-unauthorized`: rejected authentication ends the session; login returns to the same review.
10. Add `mode=confirmation-error`: saving succeeds but confirmation loading fails once. Reload confirmation must retrieve the saved booking without posting again.
11. Tamper with URL dates/guests or use `test-0` (missing price/capacity): confirmation must stay disabled.
12. Repeat review and confirmation at 320px, 390px and desktop widths and use keyboard navigation.

Recorded locally: login and preserved selection, edit/return, successful save/receipt, double-click, price reconfirmation, new overlap, POST rejection, uncertain outcome, rejected session and confirmation retry passed with fixtures. Mobile review and confirmation have no horizontal overflow at 320/390px. Unit tests cover payload, UTC nights/total, final validation and uncertain POST outcomes.
Live booking creation and persisted confirmation reload still require the user's manual test with their account; no live bookings were created by these checks.

## Profile and editing — package #20

Open `/tests/browser/venues.html?path=/profile&signedIn=1`. Authentication and profile changes are held in memory; no Noroff profile or real saved session is changed. Reloading the fixture resets its data.

1. Check profile name, email, bio, avatar and banner. Edit profile should focus Bio.
2. Change Bio, then Cancel: the displayed profile must remain unchanged. Reopen: the original values return.
3. Save a new bio and public image URLs/descriptions. The returned profile and success message should appear. Navigate to Explore and back to verify another profile GET returns the saved fixture data.
4. Bio accepts up to 160 characters, image URLs 300 and descriptions 120. Invalid/non-HTTP(S) image URLs are rejected. Empty image URLs preserve current images/descriptions; empty Bio clears the bio.
5. Use `mode=profile-empty` and `mode=profile-broken` to check placeholders. Bio-only saves must work with unchanged broken images.
6. Use `mode=profile-error`: the first profile GET fails, then Try again succeeds.
7. Use `mode=profile-save-error`: Save shows a rejection, retains the draft and re-enables the form. Cancel restores the original profile.
8. Use `mode=profile-unauthorized`: Save ends the rejected session and sends the user to login.
9. Become a venue manager should update the session, show the manager badge and add manager links to the account menu. Editing bio/media must never change manager status.
10. Repeat view/edit with keyboard and at 320px, 390px and desktop widths. Save and Cancel are disabled while saving.

Recorded 2026-10-31: fixture view, Save/Cancel, returned fields, navigation/refetch, missing/failed images, validation, retained draft on rejection, retry, manager upgrade and responsive view/edit passed in local Chromium. Automated tests cover trimmed/whitelisted payloads, unchanged media, safe URL protocols and length boundaries.
Persistent saving and publicly accessible image validation against Noroff remain for the user's manual check with their own account.

### Account layout and profile header

- The larger avatar overlaps the banner. Identity and the optional Venue manager badge sit beside it on desktop and below it on mobile.
- Desktop account pages show Profile and My bookings in a left sidebar. Add `manager=1` to the signed-in fixture URL for Dashboard, My venues, Bookings and Create venue.
- The header keeps Explore, My account and Log out. My account provides entry from public pages.
- On mobile, Account menu is a native select above the content. Check every manager destination and return to Profile; desktop navigation must highlight only the exact active destination.
- A regular customer's direct `/manager/bookings` visit must redirect to Profile. Upgrading to manager must immediately update the menu and badge.
- Recorded: role-based links, all four manager destinations, active states, mobile selection, access guard and view/edit widths of 320/390px passed. Manager screens retain their existing Coming soon scope; this change adds navigation, not dashboard/venue-management functionality.

## Own bookings — package #21

Open `/tests/browser/venues.html?path=/bookings&signedIn=1&ownBookings=1`. This seeds five future and five past stays in memory. No real bookings or saved sessions are changed.

1. Both groups show three stays. Upcoming stays are nearest first; past stays are most recent first. Show all and Show less expand/collapse each group independently.
2. Profile shows three upcoming stays. Its Show all link opens the complete upcoming group on My bookings.
3. Change a future booking: the original dates must be available, while other booked nights remain blocked. Change dates/guests, Review changes, Back to dates, then Save changes. The list must display the returned dates/guests and success message.
4. Cancel booking opens confirmation. Keep booking preserves it; Confirm cancellation removes it only after a successful response. Refresh and Profile must reflect the deletion.
5. Past stays have no change/cancel actions. Unit tests also reject other customers' bookings and stays that have already started.
6. Add `mode=own-error`: the initial list request fails and Try again succeeds. `mode=own-empty` gives empty groups. `mode=own-save-error` rejects PUT/DELETE and preserves the booking/draft with an error.
7. Repeat list and date editing at mobile widths. Check keyboard access to navigation, calendar and confirmation controls.

Recorded 2026-10-31: three-per-group, expansion, profile navigation, guest/date saving, retained draft, confirmation/Keep booking, deletion/refetch, empty state, list retry and rejected PUT/DELETE passed in local browser fixtures. List at 320px and editor at 390px had no horizontal overflow. Automated tests cover grouping/date boundaries, pagination, ownership, self-exclusion, overlap rejection, price changes and mutation payloads.

Live persistence still requires manual testing with the user's account. The API exposes DELETE without cancelled-booking history, so cancelled stays cannot be listed as a separate status.

### Booking card layout and prices

Cards on My bookings and Profile include address/location, current nightly rate and estimated total (UTC nights × nightly rate). Missing prices or invalid dates show an unavailable total. The API does not retain the rate at reservation time, so estimates are labelled accordingly.

Recorded: desktop photos fill the card height, Change/Cancel stack on the right, and mobile cards stack photo/content/actions without horizontal overflow at 320px, including long unbroken locations. Profile prices and cancellation confirmation/Keep booking were checked with the same fixtures. Unit tests cover past stays, UTC night counts, fractional prices, zero prices and unavailable totals.

## Complete customer journey — package #22

### Local integration check, 2026-10-31

Environment: local Vite development build, in-app Chromium browser, desktop and mobile viewport overrides of 390px and 320px. The existing fixtures render the real pages, authentication provider and request client, with simulated API responses held in memory. These results do not establish persistence against Noroff or constitute tests on physical mobile devices.

| Check | Observed result |
| --- | --- |
| Home search → results → venue details | Query preserved; matching venue opened |
| Calendar selection → Reserve while signed out | Login required; selected dates, guests and return path preserved |
| Login → review → confirmation | Same selection shown; correct nights/total and booking reference returned |
| New booking → Profile → My bookings | Same reservation appears on both pages |
| Change new booking → review → save | Same reservation updated; new guest count shown in list |
| Cancel → Keep booking | Reservation preserved |
| Cancel → Confirm cancellation → Profile | Reservation removed; upcoming list empty |
| Mobile login → reserve → profile → edit → cancel | Flow passed at 390px, with final list/cancellation at 320px and no horizontal overflow |
| Keyboard submission | Enter activated confirmation/save cancellation controls |
| Price changes during final preflight | Updated total shown; second confirmation required before saving |
| Another booking takes selected dates | Overlap error shown; no confirmation |
| Response lost after POST saved | Warning shown and repeat submission disabled; saved reservation visible on Profile |
| Authenticated request rejected with 401 | Returned to login; new login restored original dates/guests and review |
| Automated checks | 35 tests passed; lint and production build passed |

Repeat the desktop flow from `/tests/browser/venues.html?path=/`: search for `Test stay 2`, open its result and choose a future available range. Use `fixture@stud.noroff.no` and any password meeting the login form's requirements. Login is simulated and never sends these values to Noroff. Continue through confirmation, Profile, My bookings, edit and cancellation without reloading the fixture.

For mobile or failure cases, start from `/tests/browser/venues.html?path=/venues/test-2/reserve%3Ffrom=2090-03-25%26to=2090-03-28%26guests=2`. Add `signedIn=1` to bypass initial login, and a documented mode such as `booking-price`, `booking-conflict`, `booking-uncertain` or `booking-unauthorized`. Open a fresh fixture for each scenario. Existing #19–21 instructions cover individual invalid-input, empty-state and rejected-mutation checks.

No application changes were necessary during this integration check. The existing fixtures reset on full reload, so the following live checks remain **unverified**, not passed:

- With a real account, create a future reservation and note its reference. Reload the confirmation URL: the same booking must appear without a duplicate.
- Reload Profile and My bookings, then log out and back in: the reservation must remain available to its owner.
- Change the reservation's dates/guest count. Reload and verify the returned values and unchanged reference.
- Cancel a disposable reservation created for this check. Reload both lists and verify it is absent.
- Repeat the main journey in the deployed Netlify version, including direct protected URLs and session restoration after reload.

Overall status: local integration checks passed; live persistence/deployment validation remains pending. No real bookings were created, changed or deleted by these checks.

## Public host profile

Open `/tests/browser/venues.html?path=/venues/test-2`. Click the host's name/avatar. Without a session this opens login; use the fixture email/password described above and verify return to `/profiles/:name`. Noroff's profile endpoints require authentication (an unauthenticated live GET returned 401), so “public” means another user's read-only profile, not anonymous API access.

- The profile shows banner, overlapping avatar, name, optional manager badge and bio on the left, with Venues on the right at desktop widths. Mobile stacks these sections.
- The venue list initially shows three compact rows. View all expands the entire list, including additional pages (the fixture returns five per API page); Show less restores three.
- Every venue row opens the corresponding venue details. Rows show name, location and nightly price, with fallbacks for unavailable images/location/price.
- No Edit profile, manager upgrade, account sidebar or private bookings appear in the host profile, including when viewing your own name through `/profiles/:name`.
- Use `path=/profiles/missing&signedIn=1` for a missing profile. Use `path=/profiles/host&signedIn=1` with `mode=host-empty`, `host-broken` or `host-error` for empty venues, failed images, or a first-load failure followed by successful Try again.
- Check direct profile links while signed in and out, and check keyboard focus on the host link, venue links and View all/Show less.

Recorded 2026-10-31: venue → host → login → host return, profile data, three/all/seventeen venue rows across pages, venue detail navigation, 404, retry, empty list and image fallback passed with local fixtures. Long names/locations had no horizontal overflow at 320px; missing-image profile also checked at 390px. Automated checks verify pagination, encoded names, cancellation, failures and read-only request behavior. Live authenticated profile content still requires manual verification with a real account; no credentials or profile changes were sent to Noroff.
