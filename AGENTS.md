# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 3, Pinia, TypeScript simulator built with Vite. The main
application entrypoint is `src/main.ts`, with routing in `src/router/index.ts`.
Tax state, calculation getters, URL hydration, and saved-simulation persistence
live in `src/store/index.ts`; focused tax helpers can live beside it in
`src/store/`. UI controls and breakdown views are under `src/components/`, while
top-level route views are in `src/views/`. Cypress E2E specs live in
`cypress/e2e/`.

## Build, Test, and Development Commands

Use `npm install` or `npm ci` to install dependencies. Start local development
with `npm run dev`, which runs Vite with `--host`. Build production assets with
`npm run build`. Run all unit tests with `npm run vitest -- --run`; run a single
Vitest file with `npm run vitest -- src/store/taxes.spec.ts --run`. Run Cypress
headlessly with `npm run cy:e2e:run`, or interactively with
`npm run cy:e2e:open`.

## Coding Style & Naming Conventions

Formatting is governed by Prettier using double quotes and semicolons
(`.prettierrc.json`). The project uses Tailwind utility classes in Vue
templates and stores shared domain types in `src/typings.ts`. Existing
component files use PascalCase names, and Pinia actions generally update both
state and URL query parameters when the state is user-controlled.

## Testing Guidelines

Vitest is configured in `vitest.config.ts` with `jsdom` and globals enabled.
Store behavior is covered in `src/store/taxes.spec.ts`; add focused helper tests
next to helper modules when domain calculations can be tested independently.
Cypress uses `cypress.config.ts` with `baseUrl` set to `http://localhost:8261`
and the project scripts start Vite before running E2E tests.

## Commit & Pull Request Guidelines

The source archive did not include Git history, so no project-specific commit
message convention can be inferred. The README invites issues and pull requests;
keep PRs scoped to one behavior change and include the validation commands that
were run.
