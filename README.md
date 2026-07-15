# ui-contract

## Verification

`npm run verify` runs the unit tests, the browser-DOM localization audit, and the production build. On a clean clone, install dependencies and the required Chromium binary once before the first verification:

```sh
npm install
npm run test:ui-audit:install
npm run verify
```

The browser install is explicit and is not performed by `verify`. Local Playwright state, results, and reviewer screenshots belong in `output/playwright/` and are ignored by Git.
