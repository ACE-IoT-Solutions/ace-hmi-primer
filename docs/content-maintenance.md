# Maintaining the learning resources

## Questions

Edit `src/data/questions.json`. Each entry has a stable ID, revision, lesson topic, difficulty, prompt, exactly four distinct options, a zero-based correct index, an explanation, a source clause locator, and a basis label.

Use `Mandatory requirement` only when the cited provision actually imposes a requirement. A clause containing some requirements also contains recommendations. Use `Standard guidance`, `Standard definition`, `Applied design judgment`, or `ACE applied practice` as appropriate. Cite the licensed primary reference for standard claims and distinguish applied examples from its text.

Keep one defensible answer. Prefer plausible misconceptions to trivia about this application. Avoid claiming that arbitrary colors, temperature thresholds, click counts, or refresh settings are universally mandatory. Keep the source PDF, screenshots of its pages, and verbatim extracts out of app assets and review exports.

Increment `revision` whenever meaning, options, correct answer, or the tested principle changes. Revision changes invalidate old attempts and any affected active round; spelling-only corrections that preserve meaning need not reset practice. Do not reuse an old ID for a different concept.

Regenerate and check review artifacts:

```sh
npm run quiz:review
npm run quiz:receiver
npm test
npm run quiz:review:check
```

The generated `docs/question-review.html` and `docs/question-review.csv` show every option, answer, rationale, clause, and basis. The CSV includes a review-notes column. Keep annotated copies separately; generation replaces both files. Independent reviewers should check that the clause supports the claim, the modal strength is correct, the answer is unambiguous, and the distractors are reasonable.

The tests intentionally expect five entries for each of the eight lesson topics and forty total. Update the bank-size assertions and user-facing copy together when expanding the curriculum. Round length is defined in `src/lib/quiz.ts`. When answers or revisions change, regenerate `integrations/google-apps-script/QuestionBank.gs` with `npm run quiz:receiver` and update the Apps Script version alongside the frontend release. The build checks the generated receiver metadata for drift. A deployed receiver rejects mismatched revisions.

## Lessons and glossary

Edit `src/data/lessons.ts` and `src/data/glossary.ts`. Preserve stable lesson IDs because questions, bookmarks, and completion records refer to them. Add source locators to new entries. Write original summaries rather than copying the standard’s sentences or illustrations.

## Design lab

The lab’s process values are fixed teaching data. Preserve explicit labels for simulated data, stale observations, illustrative ranges, and controller acceptance. Do not imply that an entered or accepted command establishes physical process response. Test scenario switching, grayscale legibility, invalid input, cancel, and confirmation after changing it.

## Visual system updates

Refresh the vendored CSS from `../ace-visual-system/src/styles/system.css` intentionally and update its provenance note. Keep local layout rules in `src/style.css`. Use ACE semantic variables for application colors, source typography, 6–8 px component geometry, and visible focus indicators. The neutral operating-display example retains its teaching-specific presentation.
