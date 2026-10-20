# SlotLedger — QA Release Check

## Assessment scope

- Evidence reviewed: 2026-10-20, for public repository commit `0ad96e8`, its CI/deployment run and a separate hosted smoke check.
- Intended use: an educational portfolio demo with a fixed booker identity, two rooms and browser-local persistence.
- Local verification, CI and GitHub Pages deployment passed. The [live demo](https://mattzurr.github.io/slotledger-qa-automation/) was checked in an isolated Chromium context.

## Risks and existing test coverage

These are high-priority risks to the core flow, not claims of current defects. Test coverage below describes assertions in source; execution status is recorded separately.

| Risk and user impact | Existing coverage | Evidence gap |
| --- | --- | --- |
| Conflicting reservations undermine room availability. | [Vitest](../src/validation/bookingValidator.test.ts) covers overlap variants/boundaries; [Playwright](../e2e/booking.spec.ts) checks rejection and preservation of the original booking after reload. | No multi-tab consistency evidence. |
| A confirmed booking disappears after reload. | [Vitest](../src/storage/bookingStorage.test.ts) checks mocked JSON write/read; Playwright checks persistence and preservation of the original booking after a simulated write exception. | No actual browser quota-exhaustion coverage. |
| Invalid stored records compromise the list or subsequent validation. | Vitest checks JSON, structure, dates/times, identifiers and duplicate IDs; Playwright checks malformed JSON and an impossible stored date, including the load alert, blocked creation, hidden empty state and unchanged stored data. A simulated read exception also checks the blocked UI. | Other semantic-storage cases remain untested in the browser. |

## Execution evidence

Local execution on 2026-10-16: Windows / Node.js 22.14.0, after npm ci. Chromium used port 4174, one worker, forbid-only and a five-minute global timeout.

Local verification on 2026-10-17: 12/12 Chromium tests passed with the same port and runner options; the production build passed. Application code, unit tests and dependencies were unchanged, so Vitest was not repeated.

CI execution: [push-triggered run 39424561466](https://github.com/MattZurr/slotledger-qa-automation/actions/runs/39424561466) for commit `0ad96e8`, on 2026-10-20. Job logs confirm npm ci, 93/93 Vitest, the production build, Chromium installation and 12/12 Playwright tests on Ubuntu with Node.js 22.23.3. The `playwright-report` artifact was uploaded successfully. Pages artifact upload and deployment also succeeded.

| Check | Result for this directory |
| --- | --- |
| Local Vitest | **93/93 passed**, two files |
| Local Playwright | **12/12 passed** on 2026-10-17, Chromium, port 4174, one worker |
| Local production build | **Passed**, TypeScript and Vite; JS, CSS and favicon use the intended base |
| GitHub Actions | **Passed** at `0ad96e8`: 93/93 Vitest, build, 12/12 Chromium and report upload |
| GitHub Pages and deployed smoke check | **Passed** on 2026-10-20: create, reload persistence, overlap rejection and adjacent bookings |

The maintained local and CI Playwright suite targets a Vite development server. A separate hosted smoke check used an isolated Chromium context to create a booking, verify it after reload, reject an overlap and accept an adjacent booking; both saved bookings survived another reload. The page, JavaScript, CSS and favicon returned HTTP 200. No browser console errors or uncaught page errors were observed. This smoke check does not repeat the full E2E suite against the deployed application.

Report upload was verified through job steps/logs. HTML artifacts expire after seven days; the linked CI run records the execution results. These results do not establish cross-browser or production readiness.

## Product limitations and remaining gaps

- Fixed demo identity and rooms; no authentication, shared availability, cross-device synchronization, or edit/delete. Browser-local storage is not a durable shared booking service.
- Same-day bookings only. Storage checks structure/date/time/IDs, but does not re-check stored overlaps or current room membership.
- Chromium only; storage failure coverage includes malformed JSON, one impossible stored date and simulated read/write exceptions. Actual quota exhaustion and other semantic-data cases remain gaps.
- Main-push CI, manual CI/deployment and successful report upload are verified. PR execution, report upload after failure and deployment blocking on failure remain unexercised.
- npm ci reported one high-severity dependency finding. The unchanged dependency versions include source-map-js 1.2.1, previously flagged in development tooling. The app has no user source-map processing flow; no exploit of the booking flow has been demonstrated and no dependency fix was applied.

## Conditional release recommendation

The **conditional Go for an educational, single-browser demo** remains the product-scope recommendation, within the limitations above. Local tests/build, CI, deployment and the hosted smoke check passed. The public repository and live demo are available for portfolio review.

This recommendation does not cover production/shared room booking. Confirmed loss of a saved booking, acceptance of a conflict during creation, or destructive handling of failed reads would mean **No-Go until corrected and reverified**. Reassess the tooling finding before adding untrusted source-map processing.
