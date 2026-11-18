# Contributing to Openform

Use Node.js 22.13 or newer. Install dependencies with `npm ci`, then start the app with `npm run dev`. The frontend proxies API requests to the local SQLite service.

Before a pull request:

```sh
npm test
npm run test:demo
npm run build
npm run build:pages
```

Test both deployment modes when changing routing, sharing, persistence, or submissions. The Pages mode must work under `/openform/` and must clearly describe browser-local response storage. Keep form and response data out of Git. Test keyboard navigation and a narrow screen for UI changes.

Prefer small, focused changes. Include a concrete reproduction for a bug and screenshots for a visible interface change. Do not introduce fabricated product metrics, hidden tracking, or unsupported feature claims. Remotion source lives in `video/` and has its own dependency lockfile.
