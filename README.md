# 🏡 Holidaze

Accommodation booking frontend for the Noroff FED2 Project Exam, built with the existing Noroff Holidaze API.

[Live website](https://holidaze-fed2-pe2-stiansame.netlify.app/) · [Repository](https://github.com/stiansame/fed2_pe2_holidaze)

## 🛠️ Stack

React, JavaScript, React Router, Vite and Tailwind CSS. Hosted on Netlify.

## 🚀 Run locally

Requires Node.js 24.12 or newer within version 24, and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

## 🔑 Environment variables

Public venue requests require no credentials. For authenticated requests, copy `.env.example` to `.env.local`, set `VITE_NOROFF_API_KEY` to your Noroff API key and restart Vite.

`.env.local` is ignored by Git. Vite includes this key in the browser bundle; it is not a server secret. Never store passwords or access tokens in environment files.

## 📋 Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check JavaScript and React code |
| `npm test` | Run tests using Node's built-in test runner |

Tests live in `tests/`. Browser fixtures and instructions are in [tests/browser/README.md](tests/browser/README.md).

## 🌐 Deployment

Netlify builds from `main`. The root `netlify.toml` sets Node.js 24, runs tests, lint and build, publishes `dist/` and handles direct links to React routes.

Set `VITE_NOROFF_API_KEY` in Netlify with the Builds scope and redeploy after changing it.

## 🎨 Design and resources

- [Design overview](https://www.figma.com/design/LptrPARgLhqR37Q3oRYJDw/Holidaze-Design-overview)
- [Original design and prototype](https://www.figma.com/design/Ul6uak83ouRbde2yOVWPHe/Holidaze)
- [Sitemap and user flows](https://www.figma.com/board/fbrkKssEjAdOFtDyUkCZSK/Holidaze)
- [Noroff Holidaze API](https://docs.noroff.dev/docs/v2/holidaze/venues)

## 📅 Project planning

[GitHub Project](https://github.com/users/stiansame/projects/6)

| View | Purpose |
| --- | --- |
| [Task List](https://github.com/users/stiansame/projects/6/views/1) | Tasks, priorities and milestones |
| [KanBan](https://github.com/users/stiansame/projects/6/views/2) | Task status |
| [Timeline](https://github.com/users/stiansame/projects/6/views/3) | Schedule and dates |
