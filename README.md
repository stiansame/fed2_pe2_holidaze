# 🏡 Holidaze

Accommodation booking frontend for the Noroff FED2 Project Exam, using the existing Noroff Holidaze API.

## 🚧 Status

M2 project foundation: React, Vite, Tailwind CSS, routing, design tokens and a shared API client. The home page is a temporary starting point. Login, venue screens and booking flows are not implemented yet.

## 🚀 Run locally

Requires Node.js 24.12 or newer within version 24, and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Public venue requests require no credentials.

For authenticated requests, copy `.env.example` to `.env.local`, set `VITE_NOROFF_API_KEY` to your Noroff API key and restart Vite. Vite exposes this value in the browser bundle; it is not a server secret. Never put passwords or access tokens in environment files. Login and session management will be added in #9.

## 🛠️ Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application into `dist/` |
| `npm run lint` | Check JavaScript and React code |
| `npm test` | Test the API client using Node's built-in test runner |
| `npm run preview` | Preview the production build locally |

## 📁 Structure

```text
src/
  main.jsx          Application entry point
  App.jsx           Routes and shared page container
  pages/            Home and 404 pages
  api/client.js     Shared API requests and errors
  styles/index.css  Tailwind and Figma design tokens
```

Components, features and hooks will be added when needed. Keep components focused, share repeated logic and avoid unnecessary dependencies.

## 🔌 API client

`apiRequest` accepts a relative API path and optional `method`, `query`, JSON `body`, `token`, `apiKey` and abort `signal`. It returns the full `{ data, meta }` response, or `null` for a successful empty deletion response. Use `meta.nextPage` to request the next page while retaining the same search and filter parameters.

```js
import { apiRequest } from './api/client.js';

const { data, meta } = await apiRequest('holidaze/venues', {
  query: { page: 1, limit: 12 },
});
```

`ApiError` exposes `message`, HTTP `status` and Noroff's field-level `errors`. Network failures use status `0`; cancellation is rethrown unchanged. The client does not change form input, clear sessions or retry writes automatically. Callers retain their state and decide how to display errors.

## 🎨 Design and API

- **Link to Figma files**
- [Noroff Holidaze API](https://docs.noroff.dev/docs/v2/holidaze/venues)

The interface uses English. Inter is loaded from Google Fonts with a sans-serif fallback. Colours, typography and spacing follow the Figma guide and Tailwind’s spacing scale.

Venue content will come from the API. Files in `ai-genererte_bilder/` are design references and are not bundled with the application.

## ✅ Manual checks

Open `/` and an unknown path such as `/missing`. The latter should show the 404 page; “Back to home” should return to `/`. Check both pages at mobile and desktop widths and verify keyboard focus on the link.

## 📦 Delivery

Planned hosting: Netlify. Configure an SPA fallback to `index.html` when deploying so direct links work. Deployment is not configured yet.

Repository: [stiansame/fed2_pe2_holidaze](https://github.com/stiansame/fed2_pe2_holidaze). Planning board, Gantt chart and hosted demo links will be added before delivery. Final changes must be merged into `main`.
