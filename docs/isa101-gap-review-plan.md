# HMI Primer: ISA-101 Gap Review and Implementation Plan

As of 2026-11-25 · Prepared from a review of the `deploy` branch

## Summary

The primer is accurate, but it misses alarms, overrides, failure of the whole display, display styles, navigation design and the workspace side of ISA-101. This plan fixes eight content issues, then adds 3 lessons, 12 lab scenarios and about 20 questions over four phases.

**What was reviewed:** the full text of ANSI/ISA-101.01-2015 (clauses 1–9, Tables 1–8) against the eight lessons, the AHU design lab, the 26-term glossary, the 40-question bank and the review checklist.

**What works:** Mandatory requirements and recommendations are kept separate. Applied ACE practices are labelled. The lab's comparison of the animated mimic with the task-focused display teaches the gap between how a display looks and the evidence it gives.

**Biggest gaps:**

- **Alarms.** The standard ties alarms into almost every clause; the primer barely covers them.
- **Multiple simultaneous upsets.** Every lab scenario has a single fault.
- **Overrides and forced values.** These are the most common real failure in building automation, and the lab has none.
- **Failure of the whole display.** Only one stale point is shown today.
- **Display styles and navigation design.** Only trends and the four-level hierarchy are covered.
- **Off-system notification, scripting in displays, hardware and viewing conditions.**

## Phase 0: corrections to existing content

These are small fixes that need no quiz revisions. Total effort is about one day.

| # | Issue | Where | Clause |
| --- | --- | --- | --- |
| 1 | The stale trend draws its last point at the right edge of the chart (where "now" normally is) and relabels the axis. That hides the 12-minute gap. Leave an empty region up to "now" so the missing data is visible. | `src/components/OperatingContext.vue:113-117` | 5.1(d), 5.1.4 |
| 2 | The teaching display uses all-caps labels throughout. The standard says mixed case scans faster and caps should be kept for single words or short phrases. Switch labels to mixed case and keep caps for brief state words. | `src/lib/lab.ts:88-106`, `OperatingContext.vue:44`, `DesignLab.vue:229-241` | 7.2.1.3 |
| 3 | The mimic critique doesn't cite the clearest support: gradients shouldn't be used on static elements, and a normal display should give minimal sensory stimuli. | `src/components/DesignLab.vue:290` | 5.2.1.2, 5.1.4 |
| 4 | The hierarchy explorer's Level 3 doesn't show interlock status. Its Level 4 doesn't show procedures, help, or interlocks and permissives, which suggests Level 4 is only point detail. | `DesignLab.vue:64-85` | 6.3.3(c), 6.3.4(a–d) |
| 5 | The command demo cites 7.2.1 generally but not the specific rule it shows: a direct process action shouldn't be possible from one accidental input. | `DesignLab.vue:439` | 7.2.1.4(b) |
| 6 | Everything is in °C. The standard says to present values in the format users actually work in, and US building operators work in °F. Add a unit toggle, or state the choice. | lab-wide | 5.1.3(d), 7.2.1.2 |
| 7 | Two glossary clause references are wrong: HMI should be 3.1.21 (not "3.1"), and Faceplate is defined in 3.1.17 (not 7.2.1.6). | `src/data/glossary.ts` | §3 |
| 8 | The standard has only six "shall" statements, but the primer never lists them. Add a card to the lifecycle lesson listing them. | `src/data/lessons.ts` (lifecycle) | 4.1, 4.2.3, 4.5.1, 4.6.1, 5.1, 9.1 |

The six mandatory requirements for item 8:

1. The HMI shall be developed and managed through a lifecycle model, and system standards shall be created and used (4.1).
2. Toolkit changes shall be made under Management of Change (4.2.3).
3. Changes to an in-service HMI shall be handled under MOC (4.5.1, 4.6.1).
4. The HMI design shall support the primary tasks of monitoring and control (5.1).
5. Four general principles shall be considered during design (5.1(a–d)).
6. HMI training shall be built into the organisation's existing training process (9.1).

## Missing or under-covered concepts

### High impact

- **Alarms and alerts**
  - The alarm/alert distinction (3.1.1–3.1.2) and how the standard relates to ISA-18.2.
  - Alarm colours reserved for alarms only (5.2.1.2).
  - Blinking used only for unacknowledged alarms, with a way to stop it (5.2.1.5).
  - Audible alarms: redundant with the visual indication, not startling, silenced after acknowledgement, priority shown by a unique sound and visual combination (5.2.2).
  - Which alarm priorities each level shows: Level 1 top priority, Level 2 top and middle plus a cue for low, Level 3 all (6.3.1–6.3.3).
  - Example access targets for alarm displays (Table 8).
- **Multiple simultaneous upsets.** One of the principles that shall be considered is helping operators prioritise during major or multiple upsets (5.1(c)). Level 1 should also show disturbance propagation paths (6.3.1).
- **Forced values and maintenance modes.** These are operations training topics (9.1.1(c), (k)). In building automation they are BACnet operator overrides, manual mode and out-of-service.
- **Failure of the display itself.** A display or item failure should be immediately apparent (5.1(d)). This is not the same as one stale point.
- **Display styles.** Table 6 lists about 12 styles, and the standard says to choose one from the display's functional requirements (6.1–6.2).
- **Navigation design** (7.2.2)
  - Hierarchical, relational and sequential designs. Relational suits utility systems, which in a building means the central plant.
  - Yoking (one action opens related displays together) and a navigation network drawing.
  - Several ways to navigate. Navigation targets coded distinctly from selectable symbols.
  - Table 8 example access targets.

### Medium impact

- **Off-system messaging** (7.2.4): unmanned control rooms, email/SMS/pager notification, automatic monitoring of the messaging system's availability, and a backup path.
- **Scripting in displays** (4.2.2.1.1): handle communication delays and failures. Control logic belongs in the controller, not the HMI computer. This applies directly to Niagara PX pages and web dashboards.
- **Number formatting and data entry** (7.2.1.2–7.2.1.6)
  - Leading zero shown for values between −1 and 1. Precision supported by the measurement. No rapidly jumping decimal point. Values in directly usable form. Table 7 example formats.
  - Inset entry fields; unavailable controls greyed out.
  - Buttons: verb labels, process buttons distinct from navigation buttons, unavailable buttons kept visible.
  - Popups: timeout with an operator override, must not hide important content, movable, clear keyboard focus.
- **Performance** (8.1–8.3)
  - Display response vs how quickly the operator detects, diagnoses and acts.
  - System categories. A boiler in a building is the standard's own example of a small process system; a multi-site BAS behaves like SCADA or RTU systems.
  - Refresh no slower than about 50% of the fastest expected response; 1–5 s is normally acceptable.
  - Show the graphic first and fill in values as they arrive.
- **User types and access** (4.1.1, 7.2.3, 7.2.5)
  - Seven user types, not just primary and secondary.
  - Temporary log-over, restrictions by scope of authority and by location, a required reason for a control action.
  - Out-of-range entries allowed when the reason is recorded.

### Lower impact (lesson text or checklist is enough)

- Two lifecycle entry points and two improvement loops (4.1)
- Task-analysis methods: hierarchical, timeline, link analysis (4.3.3)
- Console design, workload analysis and adjacency studies (4.3.1)
- FAT/SAT/SIT and deficiency tracking (4.4.3)
- Audit (4.6.2) and decommissioning (4.5.3)
- Backups covering controller configuration, not just display files (4.5.2)
- Grouping and boxes to reduce cognitive load (5.3)
- Age-related colour vision (5.2.1.2)
- Ambient light and avoiding black backgrounds (5.2.1.1, 5.2.1.3)
- Hardware: aspect ratio, video walls, touch target size on tablets (7.3)
- Role-specific training lists (9.1.1–9.1.4)
- Scope limits: the standard isn't a purchase specification, and local regulations take precedence (1.2)

## Lab scenarios

All scenarios use buildings. S3 changes an existing demo; the rest are new.

| ID | Scenario | What the learner does | Teaches | Clauses | Phase |
| --- | --- | --- | --- | --- | --- |
| S1 | Cascading upset | Chiller trip (high priority, root cause), AHU-01 supply temperature high (medium), zone comfort complaint (low), filter due (alert). Rank them, follow the propagation path on a Level 1 campus overview, then acknowledge (blink stops, the visual state stays). | Prioritisation, alarm vs alert, alarm visibility by level, unacknowledged blinking | 5.1(c), 5.2.1.5, 5.2.2.3, 6.3.1–6.3.3 | 1 |
| S2 | Override hidden in plain sight | Cooling valve held at 0% by an operator override (priority 8, set two hours ago, by a tech) while the loop asks for 92%. The mimic still shows a "cooling" coil; the task display shows override state, source and age. | Forced values, maintenance modes, command vs effective value | 9.1.1(c, k), 7.2.1.4(a) | 1 |
| S3 | Delayed or rejected write | Requested → pending (poll interval) → accepted, or → rejected because a higher-priority override holds the point. Ties to S2. | Write time vs write refresh, the echo trap | 8.3.3–8.3.4, 7.2.1.4(g) | 1 |
| S4 | Whole display loses its connection | The full display must show the failure while the browser keeps animating. Contrast with today's single-point stale case. Add a health/diagnostic view. | Failure is immediately apparent | 5.1(d), Table 6 | 1 |
| S5 | After hours, nobody notified | An alarm is routed to email/SMS, the notification service failed silently, and there's no availability monitoring. Design the monitoring and backup path. | Off-system messaging | 7.2.4 | 1 |
| S6 | Formatting and entry clinic | Fix a bad faceplate: `.5`, `72.38419`, a jumping decimal, `SAT SP OCC CLG`, an underlined non-link, a navigation button styled like a Stop button, a popup hiding the alarm. | Number, text, button and popup rules | 7.2.1.2–7.2.1.6 | 2 |
| S7 | Multi-unit mode change | Switch three AHUs to unoccupied: confirm the whole list, cancel or undo, enter an out-of-range value with a recorded reason, find a button greyed out by role. | Command entry, error avoidance, access | 7.2.1.4(c, f), 7.2.3, 7.2.5 | 2 |
| S8 | Choose the display style | Match tasks (VAV box summary, energy KPIs, BACnet network health, chilled-water plant, alarm review) to display styles. | Style selection | 6.1–6.2, Table 6 | 2 |
| S9 | Navigation map | Compare hierarchical (campus → AHU) with relational (central plant) navigation. Count clicks from alarm to diagnosis. Selecting an AHU opens its faceplate and trend together. | Navigation design, yoking | 7.2.2, Table 8 | 2 |
| S10 | Viewing context | View the same display as a mechanical-room tablet, a wall screen and a dim night room. Colour-vision simulations sit alongside grayscale. | Ambient light, hardware, colour deficiencies | 5.2.1.1–5.2.1.3, 7.3 | 3 |
| S11 | Timed detection run | Run scenarios on the mimic and on the task display. Time to detect, diagnose and respond is recorded locally. | Usability testing as evidence | 4.4.3, 8.1(b) | 3 |
| S12 | Lifecycle tabletop | Change a toolkit symbol (MOC impact). Decommission AHU-03 (dangling links, training updates). Audit one display against the style guide. One card covers logic embedded in the graphic. | MOC, audit, decommission, scripting | 4.2.2.1.1, 4.5.3, 4.6 | 3 |

## Implementation phases

| Phase | Goal | Lesson changes | Lab work | Exit check |
| --- | --- | --- | --- | --- |
| 0 | Correct existing content | Six-requirements card in the lifecycle lesson | Items 1–8 above; optional °F/°C toggle | Tests and quiz-review check pass; no question revisions |
| 1 | Alarms and overrides | New `alarms` lesson | Refactor the lab first; build S1–S5 | New Playwright scenarios pass; 5 alarm questions added |
| 2 | Structure and interaction | `hierarchy` becomes "Structure and navigation"; `interaction` and `context` expanded | S6–S9 | About 10 questions added or revised across the expanded lessons |
| 3 | People, devices, evidence | New `workspace` lesson; `performance` expanded | S10–S12 | 5 workspace questions; checklist and glossary complete |

### Architecture changes for Phase 1

- **Split `DesignLab.vue` first.** It is 478 lines, near the 500-line project limit. Extract `ComparisonPanel`, `HierarchyExplorer` and `CommandDemo`, then add `AlarmOverview` and `WriteLifecycle`. Later phases add `NavigationMap`, `FormattingClinic` and `ViewingContext`.
- **Move scenario data** from `src/lib/lab.ts` into `src/data/lab-scenarios.ts`. Keep state logic (`temperatureState`, `validateTarget`) in `lab.ts`.
- **Extend `LabSnapshot`:**
  - `alarms[]` with priority, acknowledged state and equipment;
  - per-point `{ quality, override?: { priority, source, since } }`;
  - `commState` for whole-display failure;
  - `writeState` covering requested, pending, accepted and rejected.
- **Keep the controlled comparison.** Every new scenario still feeds the same snapshot to both the mimic and the task display.

### New lessons

- **Alarms and attention** (`alarms`): alarm vs alert, relation to ISA-18.2, priority coding, unacknowledged blinking, audible design, access to alarm displays, off-system messaging.
- **Workspace, devices and access** (`workspace`): user types, task-analysis methods, console and hardware, viewing conditions, access security.
- **Structure and navigation** (expanded `hierarchy`): display styles, navigation designs, yoking, navigation drawings.

New lesson IDs are additions; existing IDs stay stable because questions, bookmarks and completion records refer to them.

## Quiz, glossary and checklist

### Quiz bank

- Add about 20 questions: 5 each for `alarms` and `workspace`, plus about 10 across the expanded lessons (display styles, navigation, overrides, off-system messaging, scripting, numeric formatting).
- Update the 5-per-topic and 40-total assertions in `tests/quiz.test.ts`, and the README and landing-page copy.
- Run `npm run quiz:review`, `npm run quiz:receiver` and `npm run quiz:review:check`. Redeploy the Apps Script receiver with the frontend release; a deployed receiver rejects mismatched revisions.
- Revise existing questions only where Phase 0 corrections change their meaning. Increment `revision` when they do.

### Glossary additions

Alarm, Alert, Display style, Dashboard, Drill-down, Yoking, Popup, Graphic element, Graphic symbol, Console, Station, Screen, Platform, Script, Usability, Commissioning, Aspect ratio, and Override / forced value (ACE practice).

### Review checklist additions

| Row | Covers | Clause |
| --- | --- | --- |
| Alarm presentation | Reserved colours, priority coding, acknowledge and silence, alarm visibility by level | 5.2.1.2, 5.2.2, 6.3 |
| Failure indication | Display and point failures are immediately apparent | 5.1(d) |
| Off-system messaging | Notification paths monitored for availability, with a backup | 7.2.4 |
| Scripting limits | No control logic in displays; delays and failures handled | 4.2.2.1.1 |
| Devices and viewing | Target devices, viewing distance, lighting, touch targets | 5.2.1.1, 7.3 |
| Audit and decommission | Periodic audits; removal updates links, documents and training | 4.5.3, 4.6.2 |

## Testing, source rules and definition of done

### Testing

- Playwright coverage for each new scenario. Examples: acknowledge stops blinking but keeps the alarm state; the override shows in both displays; a write is rejected after a delay; a whole-display failure banner appears while animation continues.
- Unit tests for new state logic in `lab.ts` (alarm ordering, override resolution, write lifecycle).
- Existing checks keep passing: scenario switching, context equality, motion pause, reduced motion, grayscale, entry validation.

### Source-material rules

These are recorded in `docs/content-maintenance.md` under "Using source material".

- **Prose:** written in our own words. Verbatim text only as a short quotation, marked as a quote, with a clause reference, at fair-use length.
- **Tables:** data from the standard's tables may be used when a table is the clearest form. Use our own layout and ACE styling, cite the clause or table, and keep "example" or "recommendation" labels.
- **Never include:** the PDF, page images or screenshots, copied figures, or long passages.

### Definition of done (each phase)

- `npm test`, `npm run build`, `npm run quiz:review:check` and `npx playwright test` pass.
- Every new claim has a clause reference and a basis label (mandatory requirement, standard guidance, standard definition, applied design judgment or ACE applied practice).
- No new file exceeds 500 lines.
- README counts and descriptions match the shipped content.

## Open decisions for the team

1. **Units:** add a °F/°C toggle, or switch the lab's default to °F for the US audience?
2. **Audio:** should the alarms lesson include an audible demo (never autoplayed), or describe audible design only?
3. **Timed detection run (S11):** keep results browser-local only, or include them in the optional results submission?
4. **Question count:** about 20 new questions takes the bank to about 60. Keep rounds at 15 questions, or lengthen them?
5. **Subject-matter review:** who does the independent clause and distractor review before the expanded bank is used for anything formal?
