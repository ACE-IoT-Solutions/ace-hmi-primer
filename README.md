# ACE HMI Primer

An interactive introduction to ANSI/ISA-101.01-2015 and effective HMI design for control engineers, building automation integrators, and operators. The curriculum covers the full HMI lifecycle, using original building-automation examples rather than reproducing the standard.

- **Live application:** https://ace-iot-solutions.github.io/ace-hmi-primer/
- **Repository:** https://github.com/ACE-IoT-Solutions/ace-hmi-primer

## Run locally

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The quiz requires an email address and privacy-policy consent before showing questions, matching BACnet Studio and CDL Explorer. Participant details are stored separately from browser-local learning progress. Practice remains usable in memory when storage is blocked; clearing browser data removes saved information.

Completed results can be collected in Google Sheets and optionally added to Pipedrive. The complete [Apps Script integration and setup guide](integrations/google-apps-script/README.md) includes a self-contained `Code.gs` receiver that accepts app-scored results without a question-bank copy and its manifest. Copy `.env.example` to `.env.local` and set `VITE_QUIZ_RESULTS_ENDPOINT` to your deployed `/exec` URL to enable collection; restart Vite or rebuild after changing it. With the variable empty, no result is transmitted.

**Change email** clears the saved participant and requires consent again. A different email starts a new round; an existing result is never relabeled. Resetting quiz progress retains the saved email. Mastery statistics remain per-browser. Only completed rounds are submitted; entering an email alone does not send a lead or result.

## Learning resources

- Ten lessons covering operator tasks, lifecycle and system standards, structure/navigation, visual emphasis, information context, interaction, performance, validation/training, alarms, and workspace/devices/access.
- Twelve building-focused lab exercises: controlled 3D comparison, cascading alarms, overrides, delayed/rejected writes, whole-display failure, notification outages, formatting/faceplates, batch commands, display-style selection, navigation/yoking, viewing context, timed tasks and lifecycle review. Exercises share a unit toggle (°C by default, °F available); the exceptional-entry clinic explicitly states its °C ranges.
- Searchable glossary with 44 terms and source locators.
- Sixty original practice questions, at least five per lesson, with explanations, source clauses, and explicit basis labels. Rounds contain 15 distinct questions.
- Results review, JSON result download, and a printable 16-topic project review checklist.

The quiz prioritizes never-attempted questions, then questions whose latest answer was incorrect, then prior correct answers. It reports latest-answer accuracy separately from questions answered correctly at least once. Current rounds and answers survive reloads. Revision changes invalidate old attempts for that question and discard affected saved rounds.

The design lab uses fixed teaching data, not a live process simulation or connection to equipment. The 3D-style artwork is original SVG with CSS animation, not a vendor screenshot. Its fan and illustrated air stream follow the fan command, so the animation continues when run proof is lost. Three selectable presentations share one scenario snapshot: decorative 3D, 3D with operating context integrated around the equipment, and a task-focused display. The two contextual views share the same trend renderer and operating evidence; they organize that evidence differently. Both also show independent valve position feedback, coil entering/leaving water temperatures and water ΔT. Travel-fault, warm-water and stale-feedback cases distinguish commands from observations and separate fault paths. Rising and recovering scenarios deliberately share instantaneous readings but have different histories. Its thresholds, operating band, targets, and command confirmation are illustrative ACE choices. Changing an accepted target does not change the measured temperature. Loss of the simulated temperature link makes the current temperature unknown rather than turning the retained reading into a current observation.

## Sources and scope

The supplied `ANSI+ISA+101.01-2015.pdf` was used to check clause references. The PDF is a local licensed reference, ignored by source control and excluded from the static build. Do not put it in `public/` or distribute it with the application. The extracted working text also lives outside this repository.

Lessons, questions, and glossary entries are original summaries and examples. In the supplied edition, clauses 4, 5, and 9 contain mandatory requirements; clauses 6–8 do not. Individual recommendations are not recast as mandatory rules. Applied practices and the building mapping of display levels are labeled accordingly. The [ISA series page](https://www.isa.org/standards-and-publications/isa-standards/isa-101-standards) provides the publisher’s context and access to the standard and supporting reports; those reports were not treated as if their full text had been reviewed.

This is practice material, not an ISA certification or an automated conformity assessment. Clause locators were checked during authoring; independent subject-matter review remains appropriate before any formal assessment use. See the [question review table](docs/question-review.html) and [CSV review copy](docs/question-review.csv).

## Development and validation

```sh
npm test
npm run build
npm run quiz:review:check
npx playwright test
```

The browser tests need a Playwright Chromium installation (`npx playwright install chromium` if unavailable). They start and stop isolated Vite servers on ports 5175 and 5176. The second uses a test-only receiver URL; every submission is intercepted by a mock, so the tests create no live result or CRM contact. The static production output is `dist/`; relative asset paths support subdirectory hosting. Only the app and imported assets are bundled.

## Project structure

| Path                               | Purpose                                                          |
| ---------------------------------- | ---------------------------------------------------------------- |
| `src/data/lessons.ts`              | Lesson copy, examples, exercises, and clause locators            |
| `src/data/questions.json`          | Revisioned question bank                                         |
| `src/data/glossary.ts`             | Plain-language reference terms                                   |
| `src/lib/quiz.ts`                  | Selection, scoring helpers, persistence validation               |
| `src/lib/quiz-results.ts`          | Participant consent, payload construction, acknowledged delivery |
| `integrations/google-apps-script/` | Sheets receiver, optional Pipedrive sync, manifest, setup guide  |
| `src/components/DesignLab.vue`     | AHU presentation and interaction exercises                       |
| `src/vendor/ace/system.css`        | ACE visual-system CSS snapshot                                   |
| `scripts/quiz-review.mjs`          | Deterministic HTML/CSV question review generator                 |

## Design provenance

The app uses the source typography (Source Sans 3 / Source Sans Pro headings and Montserrat body), semantic colors, lime primary actions, cyan secondary actions, focus treatment, and geometry from `../ace-visual-system`. A vendored CSS snapshot keeps the app independently buildable. The corporate mark is copied from its logo library; no new corporate logo was invented. See [vendor provenance](src/vendor/ace/README.md). Fonts load through the visual system’s Google Fonts import, with system-font fallbacks when unavailable.

The simulated operating display deliberately uses a neutral light surface and quieter normal states. It is an educational example of the HMI principles rather than a branded dashboard. The application chrome uses the ACE dark theme.

The [reference-project review](docs/reference-project-review.md) explains which patterns were adopted from BACnet Studio and CDL Explorer. See [content maintenance](docs/content-maintenance.md) before changing lessons or questions.

## GitHub Pages deployment

The deployment follows BACnet Studio's workflow: pushes to the `deploy` branch (or manual runs of `Deploy to GitHub Pages`) run the tests, check question review files, build the static app, and deploy `dist/` through the `github-pages` environment. Pages uses **GitHub Actions** as its publishing source.

The repository Actions secret `QUIZ_RESULTS_ENDPOINT` supplies the Apps Script `/exec` URL to the build as `VITE_QUIZ_RESULTS_ENDPOINT`. No receiver credentials are stored in the source tree. The published URL is `https://ace-iot-solutions.github.io/ace-hmi-primer/`; quiz navigation is `#quiz`, with relative assets supporting the project subdirectory. Local builds remain browser-local unless explicitly configured.

## Question updates and collection

The gap-review work in [the implementation plan](docs/isa101-gap-review-plan.md) ships ten lessons and sixty questions, with existing lesson IDs and all original forty questions preserved. Practice rounds remain fifteen questions. New material is original, clause-referenced educational content; independent subject-matter/distractor review remains pending before any formal assessment use.

Question content and scoring live in `src/data/questions.json` and the app. Edit questions, update revisions when meaning changes, regenerate review artifacts, run checks, and push to `deploy`. Adding or revising questions does not require an Apps Script update.

**One-time migration:** replace the old bank-coupled `Code.gs` with [receiver version 2026-11-26.1](integrations/google-apps-script/Code.gs), then edit the existing Apps Script deployment and choose **New version → Deploy**. Keep the existing URL and current-spreadsheet manifest. The generic receiver reports `questionBankIndependent: true`; the frontend then uses the full bank automatically. Until that migration, an older receiver's reported capacity preserves compatible core rounds. See the [receiver guide](integrations/google-apps-script/README.md).

Timed detection records use `ace-hmi-usability-runs-v1` in this browser only; they are not included in Google Sheets/Pipedrive submissions. Audible-alarm design is taught in text and exercises without audio playback. Color-view matrices and device contexts are illustrative approximations, not substitutes for tests with representative users and actual hardware.
