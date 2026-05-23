# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 TypeScript app. Application code lives under `src/`.
`src/app/` contains the App Router entry points: `layout.tsx`, `page.tsx`,
global styles in `globals.css`, and API routes under `src/app/api/*/route.ts`.
Shared client and domain logic lives in `src/lib/`, including Gemini access,
question data, coaching logic, local storage helpers, and shared types.

Project planning and QA references are kept as root Markdown files such as
`PRODUCT_SPEC.md`, `IMPLEMENTATION_PLAN.md`, `QA_CHECKLIST.md`, and
`TEST_CASES.md`. Generated and dependency directories such as `.next/` and
`node_modules/` should not be edited directly.

## Build, Test, and Development Commands

Use npm scripts from the repository root:

- `npm run dev` starts the local Next.js development server.
- `npm run build` creates a production build and runs Next.js compile checks.
- `npm run start` serves the production build after `npm run build`.
- `npm run lint` runs the configured Next.js ESLint rules.

For Gemini feedback smoke testing, use `scripts/test-gemini-feedback.ps1` after
creating a local environment file.

## Coding Style & Naming Conventions

Write TypeScript with `strict` mode in mind. Prefer explicit domain types in
`src/lib/types.ts` and import through the `@/*` alias configured in
`tsconfig.json`. Use React function components and keep route handlers named
`route.ts` inside their API route folders.

Follow the existing formatting style: two-space indentation, double quotes,
semicolons, and concise helper functions. Keep user-facing UI code in
`src/app/page.tsx` unless a reusable component becomes clearly necessary.

## Testing Guidelines

No automated test runner is currently configured. Before submitting changes,
run `npm run lint` and `npm run build`, then manually verify the relevant OPIC
practice flow in the browser. Use `TEST_CASES.md` and `QA_CHECKLIST.md` as the
manual regression checklist. If adding tests later, place them near the code
they cover and document the new command here.

## Commit & Pull Request Guidelines

This workspace does not include Git history, so use clear, imperative commit
messages such as `Add mock report route` or `Fix feedback loading state`.
Pull requests should include a short summary, verification commands run, linked
issues or specs when applicable, and screenshots for visible UI changes.

## Security & Configuration Tips

Copy `.env.example` to `.env.local` for local secrets. Set `GEMINI_API_KEY` and,
optionally, `GEMINI_MODEL`. Never commit `.env.local`, API keys, `.next/`, or
`node_modules/`.
