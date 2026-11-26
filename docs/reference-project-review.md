# Reference-project review

Reviewed the local `../bacnet-network-calculator`, `../ace-cdl-explorer`, and `../ace-visual-system` projects for the initial HMI Primer implementation.

## Useful patterns

| Concern | BACnet Studio | CDL Explorer | HMI Primer decision |
| --- | --- | --- | --- |
| Application | Vue 3, TypeScript, Vite; static deployment | Vue 3, TypeScript, Vite; Rust/WASM for simulation | Vue 3, TypeScript, Vite; no runtime backend needed |
| Teaching | Scenario-driven networking primer and packet diagrams | Primer controls connected to visible block behavior | Short task-oriented lessons paired with an AHU display lab |
| Reference | Searchable BACnet glossary | Searchable block glossary | Searchable HMI glossary with clause locators |
| Bank | JSON bank, difficulty/mode metadata, generated review artifacts | Revisioned JSON with source and basis fields | Forty revisioned JSON questions across eight topics; clause and basis per entry |
| Selection | Unmastered questions before mastered questions | Unattempted, missed, then correct questions | CDL selection pattern; 15-question rounds |
| Progress | Correct-once mastery, persistent current session | Latest-answer practice plus revision-aware correct-once progress | Both measures shown separately; missed review returns to practice |
| Review | Human-readable question-bank review and drift checking | HTML/CSV question review and build checks | Generated HTML/CSV with a deterministic drift-check command |
| Identity and delivery | Email/consent and optional results delivery | Similar opt-in reporting and badges | Email/consent gate, Google Sheets receiver, optional Pipedrive notes, local progress, and downloadable results |
| Branding | ACE palette with product-specific assets | Vendored ACE CSS and components | Current ACE visual-system CSS snapshot, source typography, and corporate mark |

## Files that informed the implementation

- BACnet Studio: `README.md`, `src/lib/bacnet-quiz.ts`, `src/components/QuizPage.vue`, and `docs/contributing-quiz-questions.md`.
- CDL Explorer: `README.md`, `web/src/components/PrimerPage.vue`, `web/src/components/QuizPage.vue`, `web/src/lib/quiz.ts`, `web/src/vendor/ace/system.css`, and its question-review generator and tests.
- ACE Visual System: `README.md`, `src/styles/system.css`, `src/lib/tokens.ts`, `src/components/AceButton.vue`, `src/components/AceBadge.vue`, and the corporate logo catalog.

## Subject-specific decisions

ISA-101 is a lifecycle and human-factors standard. A course restricted to gray graphics and alarm colors would miss system standards, users and tasks, implementation, operation, training, and change control. The eight modules therefore span those responsibilities, while the lab makes selected display and interaction concepts concrete.

The primary reference is the supplied ANSI/ISA-101.01-2015 edition. Clauses 4, 5, and 9 contain requirements; clauses 6–8 provide recommendations. The recommended display hierarchy is not described as a mandatory four-screen architecture. Example timing figures are not turned into universal mandatory scan rates. No claim is made that an ACE palette, a grayscale screenshot, or passing a quiz demonstrates conformity.

The AHU scenario translates concepts into the audience’s building-automation context. The standard does not prescribe the example’s temperature limits, ±2 °C operating band, building hierarchy, or particular confirmation flow. Data quality, command/proof, and target-versus-measurement distinctions are identified as applied practices.

## Review status and follow-on work

The original bank had five questions per lesson. The gap-review expansion adds twenty questions for sixty total, with at least five for each of ten lesson topics. Automated checks cover structure and behavior; they do not establish editorial correctness. Use the generated HTML/CSV to perform an independent clause and distractor review before treating the quiz as a formal assessment.

Potential later extensions include more demanding multi-signal diagnosis scenarios, controlled style-guide templates, task-based usability scorecards, and optional learning-record delivery. Email/consent and optional Sheets/Pipedrive collection have been added. Badges, live equipment connections, and a dedicated advanced bank remain outside the current implementation.

The gap-review implementation now includes alarm/override state, display styles, relational navigation, local timed tasks, viewing context and lifecycle tabletop exercises. See `docs/isa101-gap-review-plan.md` and the README rollout notes for receiver compatibility.
