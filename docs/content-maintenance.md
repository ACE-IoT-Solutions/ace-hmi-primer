# Maintaining the learning resources

## Questions

Edit `src/data/questions.json`. Each entry has a stable ID, revision, lesson topic, difficulty, prompt, exactly four distinct options, a zero-based correct index, an explanation, a source clause locator, and a basis label.

Use `Mandatory requirement` only when the cited provision actually imposes a requirement. A clause containing some requirements also contains recommendations. Use `Standard guidance`, `Standard definition`, `Applied design judgment`, or `ACE applied practice` as appropriate. Cite the licensed primary reference for standard claims and distinguish applied examples from its text.

Keep one defensible answer. Prefer plausible misconceptions to trivia about this application. Avoid claiming that arbitrary colors, temperature thresholds, click counts, or refresh settings are universally mandatory. Keep the source PDF and screenshots of its pages out of app assets and review exports. Follow the [source material rules](#using-source-material) for tables and quotations.

Increment `revision` whenever meaning, options, correct answer, or the tested principle changes. Revision changes invalidate old attempts and any affected active round; spelling-only corrections that preserve meaning need not reset practice. Do not reuse an old ID for a different concept.

Regenerate and check review artifacts:

```sh
npm run quiz:review
npm test
npm run quiz:review:check
```

The generated `docs/question-review.html` and `docs/question-review.csv` show every option, answer, rationale, clause, and basis. The CSV includes a review-notes column. Keep annotated copies separately; generation replaces both files. Independent reviewers should check that the clause supports the claim, the modal strength is correct, the answer is unambiguous, and the distractors are reasonable.

The tests expect sixty entries across ten lesson topics, with at least five per topic. Update the bank-size assertions and user-facing copy together when expanding the curriculum. Round length is defined in `src/lib/quiz.ts`. Scoring and revision validation belong to the app. After the one-time generic receiver migration, question additions, removals, answer changes, revisions, and round-length changes deploy through GitHub alone. Apps Script validates the submitted record's structure and consistency; it stores revision metadata without needing its own answer key. Only changes to the submission schema, storage, or CRM behavior require a receiver release. See the [receiver guide](../integrations/google-apps-script/README.md).

## Lessons and glossary

Edit `src/data/lessons.ts` and `src/data/glossary.ts`. Preserve stable lesson IDs because questions, bookmarks, and completion records refer to them. Add source locators to new entries. Write original summaries rather than copying the standard’s sentences or illustrations.

## Using source material

The primer teaches the standard; it does not reproduce it or replace the need to obtain it.

- **Prose:** Write original summaries. Verbatim text is allowed only as a short quotation marked as a quote, with a clause locator, and at a length consistent with fair use.
- **Tables:** Data from a standard table (for example, display styles, example decimal formatting, or example access targets) may be presented when a table is the clearest way to show it. Use our own layout and ACE styling rather than copying the original table design, cite the clause or table number, and keep labels such as "example" or "recommendation" where they apply.
- **Never include:** The PDF, page images or screenshots, copied figures, or long passages.

## Design lab

The lab’s process values are fixed teaching data. Preserve explicit labels for simulated data, stale observations, illustrative ranges, and controller acceptance. Do not imply that an entered or accepted command establishes physical process response. The comparison uses one `labScenarios` snapshot for all three presentations. `AnimatedAhu.vue` renders the original 3D-style SVG artwork; its rotation and moving air intentionally follow the fan command. `ContextualAhu.vue` places operating callouts inside the 3D equipment canvas; `OperatingContext.vue` groups the same evidence in the task-focused display. Both use `TemperatureTrend.vue` for identical history, target and stale gaps. Keep the contextual 3D layout a credible design attempt: judge task support without manufacturing clutter. Narrow screens reflow callouts into reading order. Keep the physical data unchanged when pausing animation or changing presentation.

The rising and recovering snapshots deliberately have identical instantaneous temperature, command, and proof values; only the history differs. Preserve that controlled comparison. The lost-proof scenario leaves the command ON and proof OFF. A spinning graphic must not be described as measured movement, and illustrated air must not be described as measured airflow. The stale scenario affects the supply-temperature link; other example signals remain available.

Test scenario switching, context equality, motion pause, reduced-motion preferences, grayscale legibility, invalid input, cancel, and confirmation after changing it. Keep specification examples labeled as original teaching language rather than standard requirements. Lab-only presentation changes do not require quiz revisions. The gap-review expansion adds twenty questions without modifying the original forty. The generic receiver supports this and future expansions without question-specific updates.

## Visual system updates

Refresh the vendored CSS from `../ace-visual-system/src/styles/system.css` intentionally and update its provenance note. Keep local layout rules in `src/style.css`. Use ACE semantic variables for application colors, source typography, 6–8 px component geometry, and visible focus indicators. The neutral operating-display example retains its teaching-specific presentation.

## Expanded scenarios and local evidence

Scenario data lives in `src/data/lab-scenarios.ts`, state helpers in `src/lib/lab.ts`, and contracts in `src/lib/lab-types.ts`. Keep all presentations on the same snapshot, including alarm acknowledgement, override metadata, point quality and whole-display connection state. Acknowledgement never clears an active condition. Write lifecycle stages distinguish intent, pending, acceptance and rejection; a rejected request cannot update the accepted target.

The source edition groups Dashboard under Functional overview and calls the chart family Graph. The style catalog includes those names and Topology rather than treating Dashboard as an additional required style. Example timing, navigation, threshold and touch targets remain recommendations or ACE choices.

Keep new source files below 500 lines. Preserve the original source-material guidance above. Audio is described without playback; units default to °C with a °F option; local timed runs are not quiz records. Independent subject-matter review is still required for formal assessment use.

## Valve travel and water-side diagnostics

`coil-diagnostics.ts` compares effective command with independent position feedback only when both are current and the illustrative travel allowance has elapsed. Values in `lab-scenarios.ts` are fixed teaching snapshots. An accepted valve write changes the effective command and resets its elapsed travel time; it never invents position feedback or water-temperature response.

The `valve-stuck` case has 92% command, 5% reported position, 6 °C entering water and 18 °C leaving water. The `warm-water` contrast has matching 92% position but 18 °C entering water. `feedback-lost` retains a stale position, suppressing any claim of a current mismatch. Water ΔT requires two current temperature observations; unavailable/retained values must not be subtracted as if current. Position agreement and temperature difference do not prove flow. The example deliberately models no water-flow sensor.

`ValveProof.vue` and `WaterDiagnostics.vue` render the same evidence in both contextual views. Keep command source/override, position feedback, sample quality and age distinct. The 120 s allowance, ±10 percentage-point tolerance and 6–8 °C supply range are illustrative site choices, not standard requirements or universal actuator specifications. Validate actual settings and installed feedback mechanisms for a facility. The model does not claim that a position mismatch proves a mechanically stuck valve; it directs investigation to actuator, linkage, valve travel and feedback.

Engineering context: [Belimo Energy Valve operating manual](https://www.belimo.com/mam/americas/technical_documents/Tech%20docs/belimo_ev-4.0-operations_manual_en-us.pdf), troubleshooting discussion, distinguishes valve/actuator, temperature sensing, hydronic availability and flow issues. This is supporting engineering context, not the source of the example's numerical settings.

## Building hierarchy workshop

`HierarchyExplorer.vue` coordinates the dedicated **Four display levels in buildings** exercise. `BuildingOverview.vue`, `BuildingOperation.vue`, `BuildingEquipmentDetail.vue` and `BuildingPointDiagnostics.vue` render distinct workstation scopes. `OperatorWorkstation.vue` provides the shared frame, navigation, condition strip, event tray and connection/write status. Level 3 uses the shared diagnostic helpers to interpret the same observations as the comparison exercise. `building-hierarchy.ts` supplies the four display jobs, case choices, summary conditions and point-faceplate metadata.

Preserve the difference between a display level and a geographic navigation folder. Both campus and single-building operators can have four display scopes. Important abnormalities and missing data must remain visible in the overview/operating views; deeper levels add supporting evidence. The fixed AHU-02 benchmark is an independent teaching row, not proof that every unmodeled service is healthy. Whole-display loss makes that reference row unverified as well.

The scenario, accepted target, units, write state and diagnostic observations remain shared as the operator moves between levels. Level 2 hosts routine controls; keep its simulated controller poll alive while navigating so a pending write does not silently disappear. Level 4 distinguishes point identity, source, engineering range, quality and snapshot age and gives access to diagnostic prompts, interlocks and permissives. Bindings/ranges and interlock states are illustrative; do not turn these prompts into an invented site procedure. A faceplate can provide Level 4 without requiring a separate full-screen display.

The hierarchy lesson and mappings are original summaries checked against the local licensed edition’s § 6.3–6.3.4 and § 7.2.2. No standard figures, page images or copied passages are bundled.

## Operator workstation graphics

The hierarchy graphics are original Vue/SVG drawings, not vendor screenshots or standard figures. `CampusOverviewGraphic.vue` shows a fictional service plan; `AirSystemSchematic.vue` shows the AHU air path; `CoilPipingSchematic.vue` shows the coil-water branch, manual isolation, control valve and independent sensors. Static line arrows indicate design direction, not measured flow. Preserve the explicit absence of a water/airflow measurement; do not infer a running plant or physical valve position from artwork. Existing observations and quality indicators remain authoritative.

Keep teaching questions, clause references, fictional-binding/range explanations and workshop instructions outside `OperatorWorkstation.vue`. Inside the frame use operational labels, values, quality, timestamps/ages, states and actions. The simulation badge remains visible. The point inspector overlays an inert equipment background on desktop and reflows on phones; its point/interlock/procedure tabs and close action must work. Schematics pan locally rather than becoming illegible or overflowing the document on small screens.

`WorkstationTargetControl.vue` reviews and confirms only the supply-temperature target. It keeps the accepted target separate from the measured process value, converts units, validates entry, waits for simulated acknowledgement and rejects a disconnected write. Keep its pending controller poll alive through display navigation. Events and alarms share the scenario model: acknowledgement changes acknowledgement state without clearing an active condition. Diagnostic conditions are labeled separately from configured alarm records.

Use `workstation.css` to set explicit control colors for the neutral operating surface. Enabled secondary controls and disabled controls both retain readable dark text; disabled inputs/buttons use their real disabled state with opacity 1. Browser checks require at least 4.5:1 text contrast for the tested enabled/disabled controls and verify keyboard sensor selection. Do not inherit pale text from the dark application chrome.
