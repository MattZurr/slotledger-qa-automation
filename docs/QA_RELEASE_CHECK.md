# SlotLedger — QA Release Check

## Assessment scope

- Assessment updated: 2026-10-16, for public repository commit `acd9268`.
- Local coverage follow-up: 2026-10-17, including two additional E2E scenarios awaiting CI verification.
- Intended use: an educational portfolio demo with a fixed booker identity, two rooms and browser-local persistence.
- The completed risk assessment is retained below. Local verification and CI passed; GitHub Pages deployment remains unverified.

## Risks and existing test coverage

These are high-priority risks to the core flow, not claims of current defects. Test coverage below describes assertions in source; execution status is recorded separately.

| Risk and user impact | Existing coverage | Evidence gap |
| --- | --- | --- |
| Conflicting reservations undermine room availability. | [Vitest](../src/validation/bookingValidator.test.ts) covers overlap variants/boundaries; [Playwright](../e2e/booking.spec.ts) checks rejection and preservation of the original booking after reload. | No multi-tab consistency evidence. |
| A confirmed booking disappears after reload. | [Vitest](../src/storage/bookingStorage.test.ts) checks mocked JSON write/read; Playwright checks persistence and preservation of the original booking after a simulated write exception. | No actual browser quota-exhaustion coverage. |
| Invalid stored records compromise the list or subsequent validation. | Vitest checks JSON, structure, dates/times, identifiers and duplicate IDs; Playwright checks malformed JSON and an impossible stored date, including the load alert, blocked creation, hidden empty state and unchanged stored data. A simulated read exception also checks the blocked UI. | Other semantic-storage cases remain untested in the browser. |

## Execution evidence

Local execution on 2026-10-16: Windows / Node.js 22.14.0, after npm ci. Chromium used port 4174, one worker, forbid-only and a five-minute global timeout.

Local follow-up on 2026-10-17: 12/12 Chromium tests passed with the same port and runner options; the production build passed. Application code, unit tests and dependencies were unchanged, so Vitest was not repeated. The two added E2E scenarios have no new CI evidence.

CI execution: [push-triggered run 38887009094](https://github.com/MattZurr/slotledger-qa-automation/actions/runs/38887009094) for commit `acd9268`, on 2026-10-16. Job logs confirm npm ci, 93/93 Vitest, the production build, Chromium installation and 10/10 Playwright tests on Ubuntu with Node.js 22.23.3. The `playwright-report` artifact was uploaded successfully. Pages artifact upload and deployment were skipped.

| Check | Result for this directory |
| --- | --- |
| Local Vitest | **93/93 passed**, two files |
| Local Playwright | **12/12 passed** on 2026-10-17, Chromium, port 4174, one worker |
| Local production build | **Passed**, TypeScript and Vite; JS, CSS and favicon use the intended base |
| GitHub Actions | **Passed** at `acd9268`: 93/93 Vitest, build, 10/10 Chromium and report upload |
| GitHub Pages and deployed smoke check | Not deployed or verified at the planned address |

Both local and CI Playwright runs target a Vite development server, not the built or deployed application. Passing CI does not establish deployment, cross-browser or production readiness. Report upload was verified through logs and artifact metadata; the report archive was not downloaded or visually reviewed.

## Product limitations and remaining gaps

- Fixed demo identity and rooms; no authentication, shared availability, cross-device synchronization, or edit/delete. Browser-local storage is not a durable shared booking service.
- Same-day bookings only. Storage checks structure/date/time/IDs, but does not re-check stored overlaps or current room membership.
- Chromium only; storage failure coverage includes malformed JSON, one impossible stored date and simulated read/write exceptions. Actual quota exhaustion and other semantic-data cases remain gaps.
- Main-push CI and successful report upload are verified. PR execution, report upload after failure and deployment blocking on failure remain unexercised. Pages remains disabled until explicitly enabled after deployment approval.
- npm ci reported one high-severity dependency finding. The unchanged dependency versions include source-map-js 1.2.1, previously flagged in development tooling. The app has no user source-map processing flow; no exploit of the booking flow has been demonstrated and no dependency fix was applied.

## Conditional release recommendation

The existing **conditional Go for an educational, single-browser demo** remains the product-scope recommendation. Local tests/build, main-push CI and the prepared-content review passed. The code repository is public with owner approval. Hosting remains pending deployment approval and verification. Confirm deployment and a browser smoke check before describing the new demo as live.

This recommendation does not cover production/shared room booking. Confirmed loss of a saved booking, acceptance of a conflict during creation, or destructive handling of failed reads would mean **No-Go until corrected and reverified**. Reassess the tooling finding before adding untrusted source-map processing.
