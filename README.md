# 🏡 Holidaze

Accommodation booking frontend for the Noroff FED2 Project Exam, built with the existing Noroff Holidaze API.

Browse and search accommodation, check availability and manage bookings. Venue managers can create listings and view an overview of their own venues and bookings.

[Live website](https://holidaze-fed2-pe2-stiansame.netlify.app/) · [Repository](https://github.com/stiansame/fed2_pe2_holidaze)

## 🛠️ Stack

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![DOMPurify](https://img.shields.io/badge/DOMPurify-0047AB?style=for-the-badge)](https://github.com/cure53/DOMPurify)
[![Netlify](https://img.shields.io/badge/Netlify-0F172A?style=for-the-badge&logo=netlify&logoColor=00C7B7)](https://www.netlify.com/)

Leaflet provides interactive maps, and DOMPurify sanitises HTML descriptions. Hosted on Netlify.

## 🚀 Run locally

Requires Node.js 24.12 or newer within version 24, and npm.

```sh
git clone https://github.com/stiansame/fed2_pe2_holidaze.git
cd fed2_pe2_holidaze
npm ci
cp .env.example .env.local
```

Set your Noroff API key in `.env.local` before testing account features, then start Vite:

```sh
npm run dev
```

Open the local URL printed by Vite.

## 🔑 Environment variables

Public venue requests require no credentials. For authenticated requests, set `VITE_NOROFF_API_KEY` in `.env.local` to your [Noroff API key](https://docs.noroff.dev/docs/v2/auth/api-key) and restart Vite.

`.env.local` is ignored by Git. Vite includes this key in the browser bundle; it is not a server secret. Never store passwords or access tokens in environment files.

## 📋 Commands

| Command            | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `npm run dev`      | Start the development server                                  |
| `npm run build`    | Build the application into `dist/`                            |
| `npm run preview`  | Preview the production build locally                          |
| `npm run lint`     | Check JavaScript and React code                               |
| `npm test`         | Run booking date, availability and price tests with Vitest    |
| `npm run test:e2e` | Run Playwright navigation checks at desktop and mobile widths |

## 🧪 Automated tests

Tests and their configuration live in `tests/`. [Vitest](https://vitest.dev/guide/) checks booking logic; [Playwright](https://playwright.dev/docs/intro) checks the 404 page, signed-out account access and venue photo previews in headless Chromium at desktop and mobile widths.

After `npm ci`, install the test browser once:

```sh
npx playwright install chromium --only-shell
```

Run the checks:

```sh
npm test
npm run test:e2e
```

Playwright starts and stops its own Vite server on port 4174; keep that port free. These tests need no real credentials and create no API records; photo editing uses intercepted API responses and a local test session. Generated results are ignored by Git. They cover a small regression baseline; use the manual checks below for complete booking/manager flows, themes and accessibility.

## ✅ Verify locally

Run `npm run lint` and `npm run build`, then `npm run preview`. Open the printed preview URL to check the production build. Stop the server with `Ctrl+C`.

Check desktop and mobile widths in both standard and Sunny Mode:

1. Open Home and Explore. Search using at least three characters, including a location or host name. Combine dates, guests, amenities and sorting; reset filters and load more results.
2. Open a venue. Browse photos, expand its description and check its map when available. Select valid dates and guests; verify the total and that booked/past nights cannot be reserved.
3. Register with an `@stud.noroff.no` address, or log in with your own account. Check invalid form input, page refresh, account navigation and logout.
4. Reserve a test stay and check its confirmation, My stays entry and account statistics. Change a future stay and cancel it after checking the confirmation prompt.
5. On a customer account, enable venue-manager access. Create a test venue, edit its fields/photos/amenities/location and check My venues. Verify venue bookings and guest profiles where booking data is available, then delete only your test venue.
6. Use Tab, Shift+Tab, Enter and Escape to check navigation, menus, forms and dialogs. Check visible focus, 200%/400% browser zoom and reduced motion.
7. Open an unknown route and a missing venue ID. Temporarily go offline in browser developer tools to check loading errors and retry after reconnecting. Refresh a nested route on the deployed site to verify routing.

These manual steps use the live Noroff API: reservations and venue changes are real. Use your own test data and remove it afterwards. Verification combines the automated tests, lint, build and the manual checks above.

## 🌐 Deployment

Netlify builds from `main`. The root `netlify.toml` sets Node.js 24, runs lint and build, publishes `dist/` and handles direct links to React routes.

Set `VITE_NOROFF_API_KEY` in Netlify with the Builds scope and redeploy after changing it.

## ✨ Features

### Mandatory specifications

**User stories**

- [x] Browse a list of venues.
- [x] Search for a specific venue.
- [x] Open a venue's detail page by its ID.
- [x] View a venue calendar showing available dates.
- [x] Register as a customer with an `@stud.noroff.no` email address.
- [x] Create a venue booking as a registered customer.
- [x] View upcoming bookings as a registered customer.
- [x] Register as a venue manager with an `@stud.noroff.no` email address.
- [x] Create a venue as a registered venue manager.
- [x] Update a venue owned by the signed-in manager.
- [x] Delete a venue owned by the signed-in manager.
- [x] View bookings for venues owned by the signed-in manager.
- [x] Log in as a registered user.
- [x] Update the signed-in user's avatar.
- [x] Log out.

**Technical requirements**

- [x] Build the frontend against the existing Noroff Holidaze API.
- [x] Use an approved JavaScript framework: React 19.
- [x] Use an approved CSS framework: Tailwind CSS 4.
- [x] Deploy to an approved static host: Netlify.
- [x] Use an approved design application: Figma.
- [x] Use an approved planning application: GitHub Projects.

**Documentation and delivery**

- [x] Provide a project timeline/Gantt chart link.
- [x] Provide a design prototype link through Design overview.
- [x] Provide a style guide link through Design overview.
- [x] Provide a kanban project board link.
- [x] Provide the repository link.
- [x] Provide the hosted application link.
- [x] Document local setup, startup and instructions for testers in README.
- [x] Merge all final changes into the default branch before submission.
- [ ] Submit the required links in Moodle using the delivery template.

### The Bells & Whistles

✦ **My account overview:** a combined profile and statistics overview, with additional venue and booking summaries for managers.  
✦ **Guest and host profiles:** signed-in users can view other profiles, aggregate stay statistics and a host's listed venues.  
✦ **Booking changes and cancellation:** customers can review changes to future stays or cancel them after confirmation.  
✦ **Combined filters and sorting:** narrow results by dates, guest capacity and amenities, then sort by name, price or newest listings.  
✦ **Live search:** debounced search includes venue descriptions, locations and host names, with selections preserved in the URL.  
✦ **Sunny Mode:** switch to a warmer colour palette and typography, with the preference saved between visits when browser storage is available.  
✦ **Interactive maps:** view venue locations and select coordinates on a map when creating or editing a venue.  
✦ **Photo galleries:** swipe through venue images and open a larger gallery with arrows, keyboard navigation and swipe support.  
✦ **Profile customisation:** edit the profile bio and banner as well as the required avatar.  
✦ **Become a host later:** existing customer accounts can enable venue-manager access without registering again.  
✦ **Function documentation:** all project functions are described in the local Function reference, including how they relate to one another. Named functions also have English JSDoc in the source code; small inline callbacks are covered by their owning function.  

## 🎨 Design and resources

- [Design overview](https://www.figma.com/design/LptrPARgLhqR37Q3oRYJDw/Holidaze-Design-overview)
- [Sitemap and user flows](https://www.figma.com/board/fbrkKssEjAdOFtDyUkCZSK/Holidaze)
- [Noroff Holidaze API](https://docs.noroff.dev/docs/v2/holidaze/venues)

Design overview includes the style guide, components, desktop/mobile pages and prototype flows. Open Present in Figma to explore the prototype. Both Figma files allow anyone with the link to view; the application includes later refinements beyond the original design.

## 📚 Documentation

- [Sources](documentation/Sources.md)
- [Notes on AI](documentation/Notes%20on%20AI.md)

## 📅 Project planning

[GitHub Project](https://github.com/users/stiansame/projects/6)

| View                                                               | Purpose                          |
| ------------------------------------------------------------------ | -------------------------------- |
| [Task List](https://github.com/users/stiansame/projects/6/views/1) | Tasks, priorities and milestones |
| [KanBan](https://github.com/users/stiansame/projects/6/views/2)    | Task status                      |
| [Timeline](https://github.com/users/stiansame/projects/6/views/3)  | Schedule and dates               |
