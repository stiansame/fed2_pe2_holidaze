# Holidaze

Accommodation booking frontend for the Noroff FED2 Project Exam, using the existing Noroff Holidaze API.

## Status

M2 project foundation: React, Vite, Tailwind CSS, routing and design tokens. The home page is a temporary starting point. Authentication, venue data and booking flows are not implemented yet.

## Run locally

Requires Node.js 24.12 or newer within version 24, and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No API credentials are required at this stage.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application into `dist/` |
| `npm run lint` | Check JavaScript and React code |
| `npm run preview` | Preview the production build locally |

## Structure

```text
src/
  main.jsx          Application entry point
  App.jsx           Routes and shared page container
  pages/            Home and 404 pages
  styles/index.css  Tailwind and Figma design tokens
```

Components, features, API utilities and hooks will be added when needed. Keep components focused, share repeated logic and avoid unnecessary dependencies.

## Design and API

- [Figma design, prototype and style guide](https://www.figma.com/design/Ul6uak83ouRbde2yOVWPHe/Holidaze)
- [Noroff Holidaze API](https://docs.noroff.dev/docs/v2/holidaze/venues)

The interface uses English. Inter is loaded from Google Fonts with a sans-serif fallback. Colours, typography and spacing follow the Figma guide and Tailwind’s spacing scale.

Venue content will come from the API. Files in `ai-genererte_bilder/` are design references and are not bundled with the application.

## Manual checks

Open `/` and an unknown path such as `/missing`. The latter should show the 404 page; “Back to home” should return to `/`. Check both pages at mobile and desktop widths and verify keyboard focus on the link.

## Delivery

Planned hosting: Netlify. Configure an SPA fallback to `index.html` when deploying so direct links work. Deployment is not configured yet.

Repository: [stiansame/fed2_pe2_holidaze](https://github.com/stiansame/fed2_pe2_holidaze). Planning board, Gantt chart and hosted demo links will be added before delivery. Final changes must be merged into `main`.
