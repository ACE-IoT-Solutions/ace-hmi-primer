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

The lab’s process values are fixed teaching data. Preserve explicit labels for simulated data, stale observations, illustrative ranges, and controller acceptance. Do not imply that an entered or accepted command establishes physical process response. The comparison uses one `labScenarios` snapshot for both presentations. `AnimatedAhu.vue` renders the original 3D-style SVG artwork; its rotation and moving air intentionally follow the fan command. `OperatingContext.vue` supplies the same operating information to the task-focused display and to the mimic when context is enabled. Keep the physical data unchanged when pausing animation or changing presentation.

The rising and recovering snapshots deliberately have identical instantaneous temperature, command, and proof values; only the history differs. Preserve that controlled comparison. The lost-proof scenario leaves the command ON and proof OFF. A spinning graphic must not be described as measured movement, and illustrated air must not be described as measured airflow. The stale scenario affects the supply-temperature link; other example signals remain available.

Test scenario switching, context equality, motion pause, reduced-motion preferences, grayscale legibility, invalid input, cancel, and confirmation after changing it. Keep specification examples labeled as original teaching language rather than standard requirements. Lab-only presentation changes do not require quiz revisions. The gap-review expansion adds twenty questions without modifying the original forty. The generic receiver supports this and future expansions without question-specific updates.

## Visual system updates

Refresh the vendored CSS from `../ace-visual-system/src/styles/system.css` intentionally and update its provenance note. Keep local layout rules in `src/style.css`. Use ACE semantic variables for application colors, source typography, 6–8 px component geometry, and visible focus indicators. The neutral operating-display example retains its teaching-specific presentation.

## Expanded scenarios and local evidence

Scenario data lives in `src/data/lab-scenarios.ts`, state helpers in `src/lib/lab.ts`, and contracts in `src/lib/lab-types.ts`. Keep both displays on the same snapshot, including alarm acknowledgement, override metadata, point quality and whole-display connection state. Acknowledgement never clears an active condition. Write lifecycle stages distinguish intent, pending, acceptance and rejection; a rejected request cannot update the accepted target.

The source edition groups Dashboard under Functional overview and calls the chart family Graph. The style catalog includes those names and Topology rather than treating Dashboard as an additional required style. Example timing, navigation, threshold and touch targets remain recommendations or ACE choices.

Keep new source files below 500 lines. Preserve the original source-material guidance above. Audio is described without playback; units default to °C with a °F option; local timed runs are not quiz records. Independent subject-matter review is still required for formal assessment use.
