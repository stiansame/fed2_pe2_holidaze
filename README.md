# 🏡 Holidaze

Accommodation booking frontend for the Noroff FED2 Project Exam, using the existing Noroff Holidaze API.

## 🚧 Status

React, Vite and Tailwind CSS foundation with shared layout, routing and an API client. Registration, login, logout and role-aware navigation are implemented. The profile supports becoming a venue manager. `/venues` searches names/descriptions automatically from three characters after a 350 ms typing pause and fetches all pages for the current search before filtering and sorting the full result set. Matching stays are displayed 15 at a time. Search, filters and sorting persist in the URL. Load more reveals the next 15 matches without additional API requests. Changing filters or sorting resets the displayed count; only a new search fetches data again. Venue cards open detail pages with host information, an accessible photo gallery and an OpenStreetMap excerpt when usable coordinates are provided. Search and filter parameters are retained when returning to the list. Availability and booking follow in later work packages. The home page features up to six randomly selected stays in a pausable carousel with a prominent search form. Slides advance every 10 seconds with a 650 ms horizontal transition. Six highly rated stays (rating 4 or higher, with photos) are selected separately from a rating-sorted API pool. Failed card images are replaced from that pool. Venue card titles show at most two lines. It samples one random API page rather than downloading the catalogue. Missing hero images are skipped. The booking and manager pages remain temporary.

## 🚀 Run locally

Requires Node.js 24.12 or newer within version 24, and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Public venue requests require no credentials.

For authenticated requests, copy `.env.example` to `.env.local`, set `VITE_NOROFF_API_KEY` to your Noroff API key and restart Vite. Vite exposes this value in the browser bundle; it is not a server secret. Never put passwords or access tokens in environment files.

Login persists the access token and minimal profile data in localStorage; passwords are never stored there. Logout removes the session. Expired tokens and authenticated API responses with status 401 end the session. Protected feature requests should use `request` from `useAuth`. Route guards control navigation; the Noroff API enforces permissions.

## 🛠️ Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application into `dist/` |
| `npm run lint` | Check JavaScript and React code |
| `npm test` | Test the API client and session handling using Node's built-in test runner |
| `npm run preview` | Preview the production build locally |

## 📁 Structure

```text
src/
  main.jsx          Application entry point
  App.jsx           Routes
  components/layout/ Shared layout, header, footer and navigation
  pages/            Home and 404 pages
  api/client.js     Shared API requests and errors
  styles/index.css  Tailwind and Figma design tokens
```

Components, features and hooks will be added when needed. Keep components focused, share repeated logic and avoid unnecessary dependencies.

Test files live in `tests/`, mirroring the source structure (for example, `tests/api/client.test.js` tests `src/api/client.js`).

## 🌐 Netlify deployment

Import `stiansame/fed2_pe2_holidaze` from GitHub in Netlify and select `main` as the production branch. The root `netlify.toml` sets Node.js 24, runs tests, lint and build, and publishes `dist`. A failed check stops the deployment. The SPA rewrite serves React routes on direct visits and refreshes; unknown routes display the application's 404 page.

Set `VITE_NOROFF_API_KEY` in Netlify's environment variables with the Builds scope before deploying. Use your own key; `.env.local` is ignored by Git and is not uploaded. Vite includes this value in the browser bundle. Redeploy after changing it.

After deployment, open and refresh `/venues`, `/login` and `/register` directly. Check that `/profile` and `/manager` redirect guests to login, and that an unknown address shows the app's 404 page. Then verify customer/manager login, session persistence and logout on the deployed site. Localhost sessions do not carry over to the Netlify domain.

## 🔌 API client

`apiRequest` accepts a relative API path and optional `method`, `query`, JSON `body`, `token`, `apiKey` and abort `signal`. It returns the full `{ data, meta }` response, or `null` for a successful empty deletion response. Use `meta.nextPage` to request the next page while retaining the same search and filter parameters.

```js
import { apiRequest } from './api/client.js';

const { data, meta } = await apiRequest('holidaze/venues', {
  query: { page: 1, limit: 15 },
});
```

`ApiError` exposes `message`, HTTP `status` and Noroff's field-level `errors`. Network failures use status `0`; cancellation is rethrown unchanged. The client does not change form input, clear sessions or retry writes automatically. Callers retain their state and decide how to display errors.

## 🎨 Design and API

- **Link to Figma files**
- [Noroff Holidaze API](https://docs.noroff.dev/docs/v2/holidaze/venues)

The interface uses English. Inter is loaded from Google Fonts with a sans-serif fallback. Colours, typography and spacing follow the Figma guide and Tailwind’s spacing scale.

Venue content will come from the API. Files in `ai-genererte_bilder/` are design references and are not bundled with the application.

## ✅ Manual checks

Open `/` and check the header links to `/venues`, `/login` and `/register`. Check the home carousel using arrows, indicators and pause/resume; rotation also pauses during hover and keyboard focus and respects reduced-motion preferences. Confirm the hero CTA opens the displayed venue and the search form opens `/venues` with the query preserved. Open an unknown path such as `/missing`: the 404 page should retain the shared header/footer, and “Back to home” should return to `/`.

At mobile widths, open Menu and verify that focus moves to the first link. Close with Escape or “Close menu”: focus should return to the Menu button and the current route should remain unchanged. Selecting a menu link should navigate and close the menu. Use Tab and Enter to check navigation and “Skip to content”. Check at 320px, 390px and desktop widths for overflow, logo proportions and readable footer text.

## 📦 Delivery

Local documentation drafts (not included in Git yet): [Notes on AI](documentation/Notes%20on%20AI.md) and [Sources](documentation/Sources.md).

Planned hosting: Netlify. Configure an SPA fallback to `index.html` when deploying so direct links work. Deployment is not configured yet.

- Repository: [stiansame/fed2_pe2_holidaze](https://github.com/stiansame/fed2_pe2_holidaze).
- Project planning: [Holidaze GitHub Project](https://github.com/users/stiansame/projects/6).

| Planning view | Purpose |
| --- | --- |
| [Task List](https://github.com/users/stiansame/projects/6/views/1) | Tasks, priorities, estimates and milestones |
| [KanBan](https://github.com/users/stiansame/projects/6/views/2) | Progress by task status |
| [Timeline](https://github.com/users/stiansame/projects/6/views/3) | Project schedule and task dates |

The hosted demo link will be added before delivery. Final changes must be merged into `main`.
