## Unified account (#99)

- `/profile` is the shared account page. `/manager` redirects there for managers.
- Manager: profile and four summary cards share the desktop top row; on mobile, profile comes first and the summary stacks one slim row per statistic on mobile (nine statistics in three columns on desktop). Test at 320/390px and desktop in both themes.
- One Venue bookings section combines current and upcoming stays, nearest check-in first, with three manager cards and Show all.
- Customer: profile editing, upcoming personal bookings and Become a venue manager remain available; no manager summary or venue lists.
- Main/account navigation uses the signed-in name and avatar. Save a new profile avatar, then check both menus and their image fallback.
- Check return links, profile save/cancel, role upgrade, loading failures and retry. Manager cards show guest/count/nights together and dates/total on the bottom row.

# Venue browser checks

## Navigation cleanup

- My venues: the pencil menu at the image’s bottom-right contains Edit venue, Delete venue and Bookings at every width. Delete retains its confirmation dialog.
- The signed-in name/avatar opens My account at `/profile`. Managers also see summary cards, My venues and Venue bookings; customers see their profile and My upcoming stays.
- Open a booking from My account: the summary shows Back to my account. Open it from a filtered Venue bookings list: Back to venue bookings restores that filter.
- Follow summary → venue → host profile and return through the links: each return restores the preceding page and its navigation context. Direct detail URLs use a sensible fallback.
- Open Edit venue from My venues and from venue details. Cancel returns to the corresponding source without saving. Saving still opens the updated venue.
- Check boxed navigation actions, visible keyboard focus and all three My venues actions at 320px, 390px and desktop.
- Home shows up to twelve highly rated stays when enough qualifying venues exist; a fresh load still randomises the selection.

## Venue bookings (#28)

- Booking summary includes the shared venue calendar in read-only mode. It opens on this reservation's month (including past stays), highlights its nights in green with checkout excluded, and shows other booked nights in red. Month navigation works in both directions; no guest selector, date selection or Reserve form appears. Missing availability produces the existing error. The original public booking calendar must still support date selection and Reserve.
- Booking cards use the same lift/shadow hover and focus effect as venue cards and respect reduced motion. Pills use caption text and a 26px height. The 32px avatar sits flush left, overlapping its pill by 3px above and below. Check readable contrast and long text at narrow widths.

- Booking cards now open `/manager/bookings/:id`, including cards on My account. The details page rechecks the venue owner before showing guest/booking data. `mode=manager-other` rejects another host's booking, including direct URLs.
- Open a card from a filtered list: Back to venue bookings preserves the venue query. Reload/direct details links work; View venue and View guest profile open the correct public pages. Reference, booking creation date, stay dates, guests and current-rate estimate are shown; no editing/cancellation actions exist.
- Booking cards use the venue image across the entire background at every width, with white pills for venue name/address, guest avatar/name, dates and guest count. Both My account and the booking overview use one column on mobile, two from 640px and three from 1280px. Long content grows the card instead of overlapping or being cut off. Check long values, fallbacks and keyboard focus at 320/390px and desktop. Account navigation highlights Bookings on nested manager booking URLs and My venues on Edit venue.
- Manager booking cards share one component between My account and the booking overview. Verify full-image booking cards and white overlay pills at all widths, including guest name/avatar and the venue address. Missing images/avatars use existing fallbacks; long names and addresses wrap.
- The unified account has a combined Venue bookings section with up to three current/upcoming stays. `mode=manager-bookings` exercises both; the Upcoming bookings statistic still excludes current stays. Each card opens the correct booking summary.
- Manager cancellation is unavailable: Noroff's deleteBookingHandler authorises only the booking's customerName, not the venue owner. Keep these cards read-only.

- `/tests/browser/venues.html?path=/manager/bookings&signedIn=1&manager=1&mode=manager-data`: loads all six own venues across two pages and shows six upcoming and six past bookings. Each group starts with three; the heading chevrons expand/collapse groups independently.
- Open Bookings from a venue’s pencil menu: only its bookings remain. The venue query survives reload and return navigation. Open Bookings from the account menu for the complete list; there is no venue dropdown. Expansion must not request more pages.
- Add `venue=test-2` to the path value (`path=/manager/bookings%3Fvenue=test-2`): only that venue’s bookings appear. An unknown/another owner’s ID shows an unavailable-venue message and no booking rows; the account Bookings link restores the complete list.
- Start from `/manager` in manager-data mode: it redirects to `/profile`. Venue bookings → Show all opens the complete overview; a booking card opens its summary. My venues → pencil menu → Bookings opens a venue-filtered overview.
- `mode=manager-bookings`: includes a current stay and invalid dates, plus more than three upcoming bookings for the first venue. The account combines current and upcoming stays; the full booking overview retains its status groups, with invalid dates in Dates unavailable. Missing customer/guest information has readable fallbacks.
- `mode=manager-empty`: helpful guidance and Create venue. `mode=manager-error`: Try again recovers. `mode=manager-missing`: an error appears instead of a misleading zero count. Refresh bookings reloads the complete data while retaining the venue query.
- Remove manager=1: Profile redirect. Remove signedIn=1: login redirect. No edit/cancel/delete booking actions appear in this manager overview.
- Manual checks remain: 320px, 390px and desktop without horizontal overflow; keyboard focus, independently expanded groups, menu highlight and Holidaze | Venue bookings title. Local browser access was unavailable during implementation; real-account and Netlify validation also remain manual.

## Rating in the shared venue form

- Create venue defaults Rating (0–5) to zero; Edit venue prefills the saved rating. Decimals such as 4.5 are accepted. Blank means zero; negative values and values above five must be rejected.
- Save a rating and verify it remains after reloading the venue and reopening Edit. Setting zero removes the numerical rating and uses the existing New display.

## Delete venue (#27)

- `/tests/browser/venues.html?path=/manager/venues&signedIn=1&manager=1&mode=venue-delete`: the pencil menu offers Edit venue and Delete venue. Cancel and Escape close the confirmation without deleting; focus returns to the trigger.
- Confirm deletion: the venue is removed from My venues, the count/empty state updates and a Venue deleted status appears.
- Open its details first: the image’s pencil menu offers Edit venue and Delete venue. Confirmation returns to My venues with the success message. The old detail URL no longer loads the venue.
- `mode=venue-delete-error`: the first DELETE fails. The dialog stays open, the error is announced and Cancel or a deliberate retry remains available.
- `mode=venue-delete-uncertain`: deletion succeeds but its response is lost. No automatic retry or success message; the error tells the user to refresh My venues to check the outcome.
- `mode=venue-delete-other` on `/venues/test-2`: neither Edit nor Delete appears for another host's venue. Signed-out and non-manager users must not see deletion controls.
- Verify at 320px and desktop: the dialog fits, the venue name wraps, Cancel initially receives focus and Tab stays within the dialog. While Deleting is shown, repeated confirmation and Escape cannot interrupt it.
- Real-account/Netlify verification remains manual. These fixtures never delete Noroff venues.

## Edit venue (#26)

- `/tests/browser/venues.html?path=/manager/venues/test-2/edit&signedIn=1&manager=1&mode=venue-edit`: name, description, price, guest capacity, both images, amenities, address and map position are prefilled.
- Change text, images, amenities and coordinates, then Save changes. The updated venue opens. My venues lists it with an Edit link. Cancel returns without saving.
- Remove the first image after changing the second image's alt text: the remaining image keeps its values. Add another image and ensure it starts empty. Remove all images and optional location fields: the saved venue must not retain old values.
- `mode=venue-edit-error`: the first PUT fails; form values and selections remain, and retry succeeds. Saving disables repeat submissions and Cancel.
- `mode=venue-edit-other`: the form is not shown for another host's venue. An unknown ID shows a readable error and return link. Without manager role the route redirects to Profile; without a session it redirects to login.
- Check at 320px and desktop width, including keyboard focus and map selection. Real-account/Netlify validation remains manual; fixtures do not mutate Noroff data.

## Compact amenity pills and logo loader

- `/tests/browser/venues.html?path=/manager/venues/new&signedIn=1&manager=1`: at 1280px the four amenity pills fit on one row. At 320px they wrap without horizontal overflow and retain a 32px pill height. Space toggles a focused pill and its selected colour.
- `/tests/browser/venues.html?path=/venues&mode=loading`: keeps a fixture GET pending so the three logo panels can be seen fanning out, rotating and swapping positions before returning to the original logo. A 3.2-second cycle includes a pause at the assembled logo. The pin follows its panel. The logo is decorative; the loading text is announced as a status.
- Enable the operating system/browser's reduced-motion preference: the logo must stay fully open and still, with the loading text visible.
- Remove `mode=loading`: the loader disappears when the venues arrive. Other data-fetch screens use the same Loading component and retain their specific loading text. Saving-button labels remain unchanged.

## Leaflet on venue details

- `/tests/browser/venues.html?path=/venues/test-2&mode=venue-map`: signed-out visitors see the shared Leaflet map centred on Bergen, with its marker and OpenStreetMap attribution.
- Mouse-wheel zoom and zoom controls work. Clicking the display map must not move the saved marker. No coordinate-selection instructions or Use map centre button appear.
- View larger map keeps the venue's original coordinates even after panning or zooming. No iframe is used.
- Remove `mode=venue-map`: fixture coordinates default to zero and the map is omitted as before. Missing/invalid coordinates do not render a misleading map.
- Checked at desktop and 320px without horizontal overflow. The form still uses the same component with coordinate selection enabled.

## Create venue (#25)

- Amenities use the same AmenityPill component as venue filters: no checkbox, the whole button toggles its selected colour, and Space works from the keyboard. Choices survive API validation errors and are included correctly in the saved venue. Verify Amenities has an inside heading like the other cards.

- Layout: three full-width cards, About (including Amenities), Photos, and Location (including the map). Desktop photo rows place URL, Alt text and a labelled trash button side by side; mobile stacks them. Street address spans its column, followed by postcode/city, country/continent and latitude/longitude pairs. All fields stay visible, with no Additional details disclosure. Checked at 1280px and 320px: no horizontal overflow, image removal preserves other values and coordinates still position the marker.

- Leaflet follow-up: no marker is selected initially. Enter latitude `60.39` and longitude `5.32`: a marker appears in Bergen. Click another map position: both fields update to six decimal places. Clearing either coordinate removes the marker.
- Keyboard users can focus/pan the map and select Use map centre. Verify the OpenStreetMap attribution stays visible and the map fits at 320px. Coordinate selection is disabled during saving and uncertain POST outcomes.
- Submit with a chosen point: the resulting venue's location map uses those coordinates. Address fields remain manual; no forward/reverse geocoding service is connected.
- Leaflet is loaded as a separate chunk for the form and venue details. It requests standard OpenStreetMap tiles with normal browser caching; unavailable tiles do not prevent manual coordinate entry.

- `/tests/browser/venues.html?path=/manager/venues/new&signedIn=1&manager=1`: create a fixture venue. Required fields are name, description, price (zero or more, at most two decimals) and a whole guest count of at least one.
- Check whitespace-only text, negative/decimal guest counts, invalid price, non-HTTP image URLs, orphan alt text and incomplete/out-of-range coordinates. Invalid data must not be submitted.
- Add a second image, enter values, then remove the first: the remaining URL/alt values must stay intact. Empty image rows and optional location fields may be omitted.
- Select amenities and enter address/coordinates. Submit once; the new venue opens with the entered name, description, price, guest capacity, photos, amenities and location. The fixture never creates a real Noroff venue.
- `mode=venue-create-error`: the first POST returns 400. Every value remains editable; retry succeeds after correction.
- `mode=venue-create-uncertain`: POST saves the fixture venue and loses its response. Submit stays disabled and the My venues link reveals exactly one created venue (`created-venue-1`). Do not automatically retry.
- Cancel returns to My venues without saving. During a pending save, form controls and Cancel are disabled. Navigating elsewhere must not redirect back when a late response arrives.
- Remove `manager=1`: an ordinary user reaches their profile. Without a signed-in session the route requires login. `mode=venue-create-unauthorized` simulates a rejected session during POST.
- Checked locally at 320px with two image rows: no horizontal overflow, and text/number fields use 16px font. Physical mobile and real-account/Netlify verification remain manual.

## Own venues (#24)

- `/tests/browser/venues.html?path=/manager/venues&signedIn=1&manager=1&mode=manager-list`: loads 18 own venues across four fixture pages. First 15 appear; the heading chevron expands all 18 and collapses back to 15.
- Venue cards open the correct details. The active account menu item and browser title are My venues.
- `manager-empty` shows guidance and Create venue. `manager-error` fails once; Try again restores the complete list.
- Checked at 320px without horizontal overflow. Manager route protection also covers the booking and venue-edit routes.
- The list requests no booking data. Create venue opens the form from #25. Editing, deleting and viewing venue bookings are separate work packages.

## Manager overview (#23, now part of My account)

- Summary cards use one slim row per statistic on mobile and three columns on desktop, beside the profile on desktop and below it on mobile. Venue search below 1024px initially shows only search and Filters & sort. Expand to access amenities, sorting, guest count, dates and reset; collapse/reopen must retain values and show the active count. The date panel expands in normal document flow on mobile. Checked at 320px without overflow; desktop retains its two-row search layout.

- `/tests/browser/venues.html?path=/manager&signedIn=1&manager=1&mode=manager-data`: six own venues across two fixture pages, 12 bookings, six upcoming and rating 5.0. Only three venue cards and the three nearest upcoming bookings are shown.
- Change mode to `manager-empty`: zero counts, `Not rated yet`, and helpful empty messages.
- `manager-error`: a readable error appears; Try again loads the manager overview.
- `manager-missing`: missing booking data produces an error, never misleading zero counts.
- Remove `manager=1`: ordinary users reach their profile. Remove `signedIn=1` too: visitors reach login.
- At 320px, My account and the fixed icon menu fit without horizontal overflow. My venues, Create venue and Bookings open their implemented pages.
- Checked locally with fixture data; real-account/Netlify verification remains manual. Automated tests cover complete pagination, aborts, failed pages, rating calculations and future/current/past/invalid booking dates.

## Formatted venue descriptions

- `/tests/browser/venues.html?path=/venues/test-2&mode=description-html`: headings, bold/emphasis, paragraphs, line breaks, links, bulleted and numbered lists remain formatted. Scripts, event handlers, unsafe link URLs and API styles are removed; the page title remains `Holidaze | Test stay 2`.
- `/tests/browser/venues.html?path=/venues/test-2&mode=description-plain`: plain text retains its single and double line breaks.
- `/tests/browser/venues.html?path=/venues/test-2&mode=description-empty`: shows `No description provided.`.
- Repeat the HTML case at 320px: content stays within the page; long tables/code may scroll inside the description.

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
   On mobile, tap the square photo to open the gallery; on desktop, use **View all photos**. Check the image fallback, separate close/arrow controls and photo counter.
   Use arrow keys, then Escape. Focus should return to the gallery opener.
   The second image is deliberately small; its controls must remain usable too.
7. Open `test-2`. Check long unbroken description, host and location text without horizontal scrolling.
8. Open `/tests/browser/venues.html?path=/&mode=data`.
   Check the still hero photo, slogan, prominent search and up to twelve highly rated cards below it.
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
- Desktop account pages show the account avatar/name and My bookings in a left sidebar. Add `manager=1` for My venues, Bookings and Create venue. No separate Dashboard link remains.
- The header keeps Explore, the signed-in avatar/name and Log out. The avatar/name opens My account.
- On mobile, the account links form a fixed bottom icon menu. Check every destination, active state and that the complete footer scrolls above the menu. Desktop uses the sidebar, including the parent highlight on nested routes.
- A regular customer's direct `/manager/bookings` visit must redirect to Profile. Upgrading to manager must immediately update the menu and badge.
- Recheck role-based links, active states, access guards and profile view/edit at 320/390px and desktop. Manager pages are implemented; there are no Coming soon placeholders.

## Own bookings — package #21

Open `/tests/browser/venues.html?path=/bookings&signedIn=1&ownBookings=1`. This seeds five future and five past stays in memory. No real bookings or saved sessions are changed.

1. Both groups show three stays. Upcoming stays are nearest first; past stays are most recent first. Heading chevrons expand/collapse each group independently.
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

- The profile shows banner, overlapping avatar, name, optional manager badge and bio. Venues appears underneath at every width using the shared venue cards.
- The venue list initially shows three shared venue cards. View all expands the entire list, including additional pages (the fixture returns five per API page); Show less restores three.
- Every venue card opens the corresponding venue details. Cards show name, location and nightly price, with fallbacks for unavailable images/location/price.
- No Edit profile, manager upgrade, account sidebar or private bookings appear in the host profile, including when viewing your own name through `/profiles/:name`.
- Use `path=/profiles/missing&signedIn=1` for a missing profile. Use `path=/profiles/host&signedIn=1` with `mode=host-empty`, `host-broken` or `host-error` for empty venues, failed images, or a first-load failure followed by successful Try again.
- Check direct profile links while signed in and out, and check keyboard focus on the host link, venue links and View all/Show less.

Recorded 2026-10-31: venue → host → login → host return, profile data, three/all/seventeen venue rows across pages, venue detail navigation, 404, retry, empty list and image fallback passed with local fixtures. Long names/locations had no horizontal overflow at 320px; missing-image profile also checked at 390px. Automated checks verify pagination, encoded names, cancellation, failures and read-only request behavior. Live authenticated profile content still requires manual verification with a real account; no credentials or profile changes were sent to Noroff.

## Follow-up validation of #19–22 — 2026-10-31

This follow-up resolves the live persistence checks marked pending in the earlier customer-journey record above. Application commit: `37a79f6`. Tests ran against the Netlify deployment and Noroff using an account signed in by the user, supplemented by the local fixtures and automated suite.

- Live profile: Cancel discarded a draft; an unsafe avatar URL was rejected before submission; blank media URLs preserved both existing images; a temporary bio survived a full reload; manager status stayed unchanged. The original empty bio was restored afterwards.
- Live booking: home search → venue → dates → review → confirmation succeeded. A two-night stay at NOK 456/night showed NOK 912. Back to dates retained the selection. Capacity validation rejected three guests for a venue allowing two.
- Test reference `399221d5-f159-47e2-ba7f-0664b26a78f4`: confirmation reloaded without creating a duplicate; exactly one reservation appeared on My bookings and Profile after reload.
- Date editing excluded that reservation's own dates. Changing to 23–26 January 2027 and one guest showed three nights and NOK 1,368. Back to dates retained the draft. Saving retained the reference and the new values survived reload.
- Keep booking preserved the reservation. After the user's explicit confirmation, cancellation removed it from both lists, including after full reload. No test reservation remains.
- Local replay passed for initial/edit price changes requiring reconfirmation, new overlaps, lost POST response, rejected POST, expired/rejected authentication with preserved selection, disabled pending confirmation, confirmation retry, retained profile draft on rejection, missing/broken profile media, three-per-group, independent expansion and the profile's Show all link.
- `mode=own-incomplete&ownBookings=1&signedIn=1&path=/bookings` now provides missing venue/image/location/price data and a current stay. Readable fallbacks and absence of mutation actions on the current stay were verified. Previous unit tests also cover invalid dates, length boundaries and ownership.
- Browser fixtures were rechecked at 320px without horizontal overflow; earlier 390px and desktop results remain applicable. These are viewport checks, not physical-device testing.

Result: the described #19–22 checks passed, with no application-code changes required. GitHub checklists, evidence and completed status were updated. No production outages or real account expiry were induced; failure paths used isolated fixtures.

Project audit: all 26 merged PRs are in the project with priority, phase, actual PR creation/merge dates, estimates and milestone. Historical closing-text references were replaced with actual Development links where necessary. #56–66 are issues, not PRs. Public host profile delivery is tracked by #72 under #20 and linked to PR #71. Estimates are planning estimates, not measured hours; dates describe PR history rather than the start of local development.

## Host information and mobile guest selection — #75

- Open `/tests/browser/venues.html?path=/venues/test-2&mode=host-bio` while signed out. The host's avatar/name link and bio must appear. Without `host-bio`, the missing-bio message appears. The existing broken avatar fixture uses the shared placeholder. The public venue response already includes `owner.bio`; no authenticated profile fetch is needed to render it.
- Booking Guests is a native select from 1 through `maxGuests`. Default fixtures allow six; `mode=capacity-two` allows two. `test-0` has no capacity and disables the menu/Reserve. There is no silently selected valid value for an invalid URL guest count: Choose guests is shown until the customer chooses a valid value.
- Example invalid selection: `/tests/browser/venues.html?path=/venues/test-2%3Ffrom=2090-03-25%26to=2090-03-28%26guests=6&mode=capacity-two`. Reserve must not proceed until a valid choice is made.
- Choose six guests in a normal fixture, Reserve while signed out, log in with fixture credentials and check the review. Back to dates must preserve six. Repeat existing booking editing with `path=/bookings/own-0/edit&signedIn=1&ownBookings=1&mode=capacity-two`: initial two guests must appear; changing to one and saving must retain that value.
- The venue-list Guests filter uses Any plus 1–100, preserving its previous search range rather than using one venue's capacity. At 390px, open Filters, choose 100 (empty results), then Any (results restored).
- At 320/390px, guest controls and other text-entry controls render at 16px with the default root font size. Check keyboard selection, readable fields and no horizontal overflow. This reduces automatic Safari focus zoom without disabling user zoom.

Recorded locally 2026-10-31: host bio/fallback, six/two guest options, invalid URL selection, missing capacity, login/review/return preservation, booking edit/save and venue-list filtering passed. At 320/390px, tested controls had 16px text and no horizontal overflow; desktop width 1280px also had no overflow. No live bookings were changed. Physical iOS/Android picker and focus-zoom behavior remains for manual device verification; viewport simulation cannot establish that result. Browser screenshot capture was unavailable during this check.
# Search dates and filter pills

- Search `Norway` (16 fixture matches) and `LongHostName` (17 matches). These appear only in location/host data, not venue names or descriptions.
- Keyboard-focus Sort by: one ring surrounds the whole pill, without an inner outline. The same fix applies to Guests.
- Open `/tests/browser/venues.html?path=/venues`.
- Toggle amenities; the whole pill is clickable and selected pills turn blue.
- Combine search, guest count and sorting. Reset clears filters and dates but retains the search text.
- Open the date pill. Set both dates; incomplete, past or reversed ranges show a message.
- Fixture venues are booked from three days after today until six days after today. Overlapping searches return no stays; checkout boundaries remain available.
- Dates and guest count follow the venue link. Escape closes the date panel and restores focus to its summary.
- Checked locally at 1280px and 320px: controls fit without horizontal overflow; mobile date fields remain readable in the expanded panel.
- Automated checks cover overlap boundaries, unknown booking data, invalid dates and requesting bookings on every API page only for date searches.

## Short booking navigation

- Change booking uses ← My bookings in both date selection and review; return destinations and query parameters remain intact.
- Manager booking details places View venue and the shortened return link on the same row in the venue summary. A booking opened from My account returns there; one opened from Venue bookings retains its venue filter. Loading/error states still offer a return link.
- My bookings → pencil menu → View venue opens that booking’s venue and preserves return navigation. Upcoming stays also offer Change booking and Cancel booking. Current/past stays offer View venue without mutation actions. Missing venues offer no broken venue link.
- Check both themes at mobile/desktop widths. These new visual checks remain manual.

## Horizontal mobile main menu

- Open the hamburger menu while signed out: three equal-width boxes show Explore, Login and Get started with icons above the text. Get started matches the desktop primary action in both themes.
- Sign in: the boxes become Explore, account avatar/name and Log out. Long names truncate inside their box. The account bottom navigation remains separate.
- Check 320px, 390px and desktop: no overflow, correct active links, keyboard focus, Escape, close X, destinations and logout. Mobile main-menu boxes are 80px high; desktop controls stay 44px. Visual checks remain manual.

## Personal and guest statistics

- My account: managers see four primary-coloured manager boxes plus five accent-coloured personal boxes, in three columns on desktop and one slim row per statistic on mobile. Customers see only five personal boxes. The personal booking list and statistics share one paginated fetch.
- Public guest profiles show five personal statistics without exposing booking cards, dates, destinations or editing actions. Hosts retain their venues underneath; guests without venues do not get an empty Host venues section.
- Verify total/completed/upcoming/current counts and whole nights against fixture bookings. Checkout today counts as completed; check-in today counts as current. Empty confirmed lists show zero; loading/failure must not show a false zero. Invalid date ranges leave the night total unavailable.
- Verify pagination, retry, avatar fallbacks, both themes and 320/390px/desktop layouts. New visual and live-account checks remain manual.

## Profile and statistic sizing

- On desktop, profile cards and the complete statistic grid share their top and bottom edges, including long bios and profile editing. Manager accounts use a 3 × 3 grid; five-box profiles use two columns and a full-width last box.
- Below 1024px, each statistic becomes a slim full-width row: icon left, label centre, value right. Verify five/nine rows, both themes, unavailable values and 320/390px without overflow. These visual checks remain manual.

## Manager and access validation — #29, 13 November 2026

Environment: local Vite at localhost:5173 with the in-memory browser fixtures. Checked through the real interface at 320px, 390px and 1440px viewport widths. No Noroff data or real saved session was used. This records local results only; live API persistence, Netlify and physical-device checks remain pending.

- Passed: create a venue; required/whitespace-only fields reject submission; confirm the saved name, price, capacity, rating and amenities on details.
- Passed: edit fields, cancel without saving, save and reopen the venue; desktop return to My venues preserves the origin.
- Passed: deletion confirmation, Cancel and Escape, successful removal from My venues, and an announced success. These deletions affect only disposable in-memory records.
- Passed: rejected create/update/delete responses keep a readable error and allow deliberate recovery; failed update preserves the draft. A lost create response disables repeat submission and reveals one saved venue in My venues. A rapid double-click on a successful retry also produces one venue.
- Passed: signed-out direct Create/My venues/Edit/Bookings/Booking details routes lead to login; signed-in customers reach My account. No manager destinations appear in the customer account navigation.
- Passed: direct editing of another host’s venue is rejected; its detail page has no owner menu. Another host’s booking details are rejected.
- Passed: own booking overview shows current, upcoming, past and unknown-date groups. Open a booking, view its venue and guest profile, and follow the contextual return links. The venue-filtered return retains its query; a booking opened on My account returns there.
- Passed: guest email appears in the manager booking summary; the public guest profile renders aggregate statistics without email, private booking cards or editing controls.
- Passed: a 401 during creation ends the session and opens login with a notice, without displaying a successful save.
- Passed: the inspected mobile create/edit/delete controls and booking views fit without horizontal overflow; desktop overview expands 15 venues to all 18. Standard/Sunny booking details were inspected and retain the same access/navigation behavior.

Fixture corrections made during this run: profile-booking responses are handled before generic profiles and filtered to the requested customer; manager fixtures assign the returned venues to the manager; guest fixtures no longer automatically get manager status; summary fixtures include a sample guest email; Sunny CSS is imported. This fixes the local “data is not iterable” profile failure and inconsistent fixture ownership, without changing production code.

Still unverified: create/update/delete persistence through real Noroff accounts and full reloads, live server-side rejection of an unauthorized mutation, Netlify deployment and physical iOS/Android behavior. The API-helper tests simulate ownership/error responses; they do not prove Noroff’s live authorization.


## Regression check — #30, 14 November 2026

Executed against the current local main checkout and the published Netlify site in the in-app browser. Local fixture requests never reached Noroff. No production records were created, changed or deleted.

- Automated: 64 tests passed; ESLint and the production build passed.
- Live desktop: home loaded twelve cards; hero search found Hammerfest; combined price sorting, six guests and WiFi produced two correctly ordered results. Venue return links retained the search and filters. HTML description, host profile, map and account/empty booking views loaded. Selecting 23–25 November produced NOK 3 000 for two nights at NOK 1 500; reset cleared selection. Gallery opened and Escape closed it. A direct unknown URL and reload showed the application's 404 page. The existing test-account session survived navigation and reload.
- Local customer: calendar showed unavailable past/booked dates. Selected dates and two guests reached review, confirmation and My bookings. Changing to three guests saved correctly. Keep booking preserved it; confirmed cancellation removed it and updated the count. Profile cancel preserved the original bio; saving updated it. Logout returned to login. The login form rejected empty required fields; the registration fields and manager choice were inspected, but successful registration was not performed.
- Local manager: unified account showed nine statistics and combined current/upcoming previews. Venue booking groups and expansion showed ten upcoming bookings. Details showed the correct guest/email, read-only calendar and contextual return. The guest's public profile omitted email. A fixture venue was created, edited and deleted; cancelling deletion retained it. These operations affected only disposable in-memory fixtures.
- Access: a signed-out manager-route visit reached login; a customer visit reached My account with only customer navigation. Further ownership/error cases remain covered by the automated suite.
- Images and errors: Explore excluded one missing cover and removed one failed cover, showed 15 of 16, then 16 of 16 after Load more. All-broken mode removed every card and displayed the empty state. API error displayed its message and Try again recovered.
- Responsive samples: 320px booking details and public guest profile, 320/390px Explore, and 1440px manager account were inspected. No horizontal overflow in the measured booking-details/Explore/account views. Both standard and Sunny Mode were exercised; mobile menu/filter disclosure worked. Back to top appeared after scrolling and moved focus to main content. This is viewport emulation, not a physical-device test.

Still open: Firefox/Safari and physical iOS/Android checks; successful live registration/login with new credentials; live booking/venue create-update-delete persistence after a fresh reload; complete theme-by-page matrix, touch swipes and reduced-motion checks. A click on Next photo was exercised, but its eventual counter change was not verified. No full browser-matrix approval is claimed. #30 is not fully validated by this run alone.
