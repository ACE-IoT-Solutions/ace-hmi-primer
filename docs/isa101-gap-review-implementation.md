# ISA-101 gap review implementation

Implemented against [the review plan](isa101-gap-review-plan.md) and the supplied ANSI/ISA-101.01-2015 edition. Existing lesson IDs, original questions and browser progress keys remain stable.

## Phase 0

- Stale charts retain an explicit empty interval from the last observation through now.
- Operating-display labels use mixed case; short state words retain clear emphasis.
- The mimic critique cites minimal normal sensory stimulation and the guidance against gradients on static elements.
- Level 3 includes interlocks; Level 4 includes procedures, help, safety shutdowns, interlocks and permissives.
- Command confirmation cites the multiple-input guidance in 7.2.1.4(b).
- A °C/°F selector converts the same underlying snapshot; °C remains the initial choice. The exceptional-entry clinic explicitly states its °C limits.
- HMI and Faceplate glossary references are corrected.
- The lifecycle lesson includes a six-group requirement card. The groups are paraphrased obligations, not a count of individual shall sentences.

## Phases 1–3

| Exercise | Shipped behavior                                                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1       | Prioritized chiller/AHU/zone cascade, separate maintenance alert, level-specific alarm views, acknowledgment stops border motion while active state remains |
| S2       | Automatic demand, effective valve command, priority-8 override, source and age exposed in the shared snapshot                                               |
| S3       | Review and confirmation, delayed pending state, accepted controller feedback or rejection; a competing valve write targets the overridden valve point       |
| S4       | Whole-display disconnect banner in both presentations, all modeled point quality unknown, retained browser animation, health diagnostics                    |
| S5       | Simulated primary notification failure, availability monitoring and independent backup-route choices                                                        |
| S6       | Repairable number/label/action clinic and a movable, focused faceplate with an extendable timeout                                                           |
| S7       | Exact-list batch confirmation, cancel, undo, read-only role and reason-required expected-range exception with absolute limits                               |
| S8       | Task/style matching and an original catalog based on Table 6                                                                                                |
| S9       | Hierarchical and relational maps, navigation action count, linked faceplate/trend opening and example access guidance                                       |
| S10      | Tablet/wall/night contexts, grayscale and illustrative color-view matrices, adjustable brightness and explicit real-hardware validation limits              |
| S11      | User-started detection/diagnosis/response timing, local records, diagnosis review and explicit uncontrolled-demo limitations                                |
| S12      | Toolkit MOC, decommissioning, audit and display-script reliability tabletop cases                                                                           |

The lab is split into bounded components. Scenario data lives in `src/data/lab-scenarios.ts`, contracts in `src/lib/lab-types.ts`, and state transitions in `src/lib/lab.ts`. Both visual presentations use the same scenario and point-quality/override metadata. New source files stay below 500 lines.

## Curriculum and reference material

- Ten lessons: eight existing IDs retained, plus `alarms` and `workspace`; `hierarchy` expands to Structure and navigation. The plan's three lesson changes therefore mean two new IDs plus one expanded existing lesson, rather than eleven total lessons.
- Sixty questions: original forty unchanged, twenty additions, at least five for each topic; rounds remain fifteen questions. HTML/CSV reviews are regenerated; the generic receiver does not contain a question lookup.
- Forty-four glossary terms and sixteen project-review checklist topics.
- New claims carry clause locators and basis labels. Source PDF, page images and copied figures remain excluded.

Two source nuances were corrected during implementation. Table 6 groups Dashboard under Functional overview and includes Topology separately; the chart family is Graph, including trends. Clause 4.2.2.1.1 calls for control logic to be implemented in a component/method meeting availability and maintenance requirements, including an HMI or control-system component; it is not a blanket prohibition on all HMI logic.

## Decisions and rollout

Audio design is described without playback. Timed records stay browser-local and are never sent with quiz results. Color-view transforms are approximations. Independent subject-matter and distractor review remains pending before formal assessment use.

The receiver now accepts app-calculated results independently of question content, IDs, revisions, bank size, and round length. It retains `spreadsheets.currentonly`, consent checks, consistency validation, and retry deduplication. One final receiver deployment (`2026-11-26.1`) replaces the old embedded answer key; subsequent question changes require only the GitHub deployment. Legacy capacity negotiation preserves compatible core rounds until that migration.

## Verification

Unit coverage includes alarm ordering/acknowledgment, overrides, write lifecycle, connection scope, unit conversion, source references, checklist counts and receiver compatibility. Browser coverage exercises every S1–S12 scenario, stale gaps, mixed units, controlled comparisons, reduced motion, mobile layouts, quiz persistence and acknowledged delivery. The receiver is tested as a standalone file with future IDs/revisions, different round lengths and larger mastery counts, without changing its source.

Original gap-review validation completed: `npm test` (38 passing), `npx playwright test` (21 passing), `npm run build`, `npm run quiz:review:check`. The original forty JSON question entries match the prior revision exactly. Manual browser inspection covered desktop alarms/overrides and all eleven exercise groups at a 390 px viewport without document overflow.

Receiver decoupling verification (2026-11-26): 38 unit tests and 22 browser tests passed, along with the production build and review-artifact check. No live quiz record or CRM contact was created. The generic Apps Script source is ready for its one-time deployment; GitHub deployment does not install that source into Apps Script.
