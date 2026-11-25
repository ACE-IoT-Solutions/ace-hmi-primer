import assert from "node:assert/strict";
import test from "node:test";
import { lessons } from "../src/data/lessons";
import {
  answerQuiz,
  byId,
  currentAttempts,
  emptyProgress,
  latestCorrect,
  mastered,
  nextQuestion,
  parseProgress,
  questions,
  quizLength,
  readProgress,
  saveProgress,
  selectQuestions,
  startQuiz,
} from "../src/lib/quiz";
import { temperatureState, validateTarget } from "../src/lib/lab";

test("question bank has unique IDs, complete original entries, source clauses, and lesson coverage", () => {
  assert.equal(questions.length, 40);
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  for (const q of questions) {
    assert.match(q.id, /^HMI-\d{3}$/);
    assert.ok(Number.isInteger(q.revision) && q.revision >= 1);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.every((o) => typeof o === "string" && o.length > 3));
    assert.ok(
      Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex < 4,
    );
    assert.ok(
      q.prompt.length > 20 && q.explanation.length > 40 && q.clause && q.basis,
    );
    assert.ok(lessons.some((l) => l.id === q.topic));
  }
  for (const lesson of lessons)
    assert.equal(questions.filter((q) => q.topic === lesson.id).length, 5);
});
test("selection produces a unique 15-question round without mutating the bank", () => {
  const before = questions.map((q) => q.id);
  const ids = selectQuestions(emptyProgress(), () => 0.4);
  assert.equal(ids.length, quizLength);
  assert.equal(new Set(ids).size, quizLength);
  assert.deepEqual(
    questions.map((q) => q.id),
    before,
  );
});
test("unseen precedes missed and prior correct; missed fills before correct", () => {
  const p = emptyProgress();
  for (const [i, q] of questions.entries()) {
    if (i < 5) continue;
    p.history[q.id] = [
      {
        revision: q.revision,
        choice: i < 12 ? (q.correctIndex + 1) % 4 : q.correctIndex,
        at: "2026-11-25T12:00:00Z",
      },
    ];
  }
  const ids = selectQuestions(p, () => 0.3);
  assert.ok(ids.slice(0, 5).every((id) => !p.history[id]));
  assert.ok(ids.slice(5, 12).every((id) => !latestCorrect(p, byId.get(id)!)));
  assert.ok(ids.slice(12).every((id) => latestCorrect(p, byId.get(id)!)));
});
test("a missed review returns to practice while correct-once progress remains", () => {
  let p = startQuiz(emptyProgress(), () => 0.4);
  const q = byId.get(p.session!.ids[0]!)!;
  p = answerQuiz(p, q.correctIndex);
  assert.equal(mastered(p, q), true);
  p.session = { ids: [q.id], revisions: [q.revision], answers: {}, index: 0 };
  p = answerQuiz(p, (q.correctIndex + 1) % 4);
  assert.equal(mastered(p, q), true);
  assert.equal(latestCorrect(p, q), false);
});
test("answer cannot be changed, invalid entry cannot be recorded, and advancement requires an answer", () => {
  const p = startQuiz(emptyProgress());
  assert.equal(nextQuestion(p), p);
  assert.equal(answerQuiz(p, -1), p);
  assert.equal(answerQuiz(p, 4), p);
  assert.equal(answerQuiz(p, 0.5), p);
  const answered = answerQuiz(p, 0);
  assert.equal(answerQuiz(answered, 1), answered);
  assert.equal(nextQuestion(answered).session!.index, 1);
});
test("starting again preserves an unfinished round", () => {
  const p = startQuiz(emptyProgress());
  assert.equal(startQuiz(p), p);
});
test("saved answer and round survive a reload; corrupted sessions are discarded but valid history stays", () => {
  const p = answerQuiz(startQuiz(emptyProgress()), 2);
  assert.deepEqual(parseProgress(JSON.stringify(p)), p);
  const bad = structuredClone(p);
  bad.session!.ids[1] = bad.session!.ids[0]!;
  const restored = parseProgress(JSON.stringify(bad));
  assert.equal(restored.session, null);
  assert.deepEqual(restored.history, p.history);
});
test("revised questions invalidate prior attempts and stale sessions", () => {
  const p = answerQuiz(startQuiz(emptyProgress()), 0);
  const id = p.session!.ids[0]!;
  p.history[id]![0]!.revision = 0;
  p.session!.revisions[0] = 0;
  const restored = parseProgress(JSON.stringify(p));
  assert.equal(currentAttempts(restored, byId.get(id)!).length, 0);
  assert.equal(restored.session, null);
});
test("malformed choice, index, or future answers cannot restore a round", () => {
  const p = startQuiz(emptyProgress());
  for (const edit of [
    (s: NonNullable<typeof p.session>) => {
      s.index = -1;
    },
    (s: NonNullable<typeof p.session>) => {
      s.index = 2;
    },
    (s: NonNullable<typeof p.session>) => {
      s.answers[s.ids[0]!] = 9;
    },
    (s: NonNullable<typeof p.session>) => {
      s.answers[s.ids[3]!] = 1;
    },
  ]) {
    const bad = structuredClone(p);
    edit(bad.session!);
    assert.equal(parseProgress(JSON.stringify(bad)).session, null);
  }
});
test("storage failures and malformed root data allow in-memory practice with a warning", () => {
  for (const raw of ["{", '{"version":9}', '{"version":1,"history":[]}']) {
    const result = readProgress({ getItem: () => raw });
    assert.ok(result.warning);
    assert.deepEqual(result.progress, emptyProgress());
  }
  assert.ok(
    readProgress({
      getItem: () => {
        throw Error("blocked");
      },
    }).warning,
  );
  assert.equal(
    saveProgress(
      {
        setItem: () => {
          throw Error("quota");
        },
      },
      emptyProgress(),
    ),
    false,
  );
});
test("complete rounds can start a fresh round while retaining attempt history", () => {
  let p = startQuiz(emptyProgress());
  for (let i = 0; i < quizLength; i++) p = nextQuestion(answerQuiz(p, 0));
  assert.equal(p.session!.index, quizLength);
  const restored = parseProgress(JSON.stringify(p));
  assert.deepEqual(restored, p);
  const next = startQuiz(restored);
  assert.equal(next.session!.index, 0);
  assert.deepEqual(next.history, p.history);
});
test("stale data never implies a known current process condition", () => {
  assert.equal(temperatureState(16, 16, true).label, "STALE DATA");
  assert.equal(temperatureState(24, 16, true).label, "STALE DATA");
  assert.equal(
    temperatureState(24, 16, false).label,
    "SUPPLY TEMPERATURE HIGH",
  );
  assert.equal(temperatureState(12, 16, false).label, "SUPPLY TEMPERATURE LOW");
  assert.equal(temperatureState(16, 16, false).attention, false);
});
test("illustrative command limits reject blank, nonfinite, out-of-range and excess-precision entries", () => {
  for (const value of [
    "",
    " ",
    "Infinity",
    "NaN",
    "abc",
    "11.9",
    "20.1",
    "16.25",
  ])
    assert.ok(validateTarget(value), value);
  for (const value of ["12", "16.5", "20", " 16 "])
    assert.equal(validateTarget(value), "", value);
});
