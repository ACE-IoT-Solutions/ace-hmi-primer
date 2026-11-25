import assert from "node:assert/strict";
import test from "node:test";
import {
  answerQuiz,
  byId,
  emptyProgress,
  nextQuestion,
  parseProgress,
  quizLength,
  startQuiz,
} from "../src/lib/quiz";
import {
  bindParticipant,
  buildResultPayload,
  isEndpointConfigured,
  isValidEmail,
  normalizeEmail,
  participantKey,
  readParticipant,
  saveParticipant,
  submitResult,
  type Participant,
} from "../src/lib/quiz-results";
const person: Participant = {
  version: 1,
  email: "learner@example.com",
  consentAt: "2026-01-01T00:00:00Z",
  remoteConsent: true,
};
const endpoint = "https://script.google.com/macros/s/TEST_DEPLOYMENT/exec";
function completedRound() {
  let p = startQuiz(emptyProgress());
  p.session = bindParticipant(p.session!, person);
  for (let i = 0; i < quizLength; i++)
    p = nextQuestion(answerQuiz(p, byId.get(p.session!.ids[i]!)!.correctIndex));
  return p.session!;
}
test("email and receiver validation reject malformed or unexpected addresses", () => {
  assert.equal(normalizeEmail(" Learner@Example.com "), "learner@example.com");
  assert.ok(isValidEmail(" Learner@Example.com "));
  for (const input of [
    "x",
    "x@",
    "a b@example.com",
    "a".repeat(255) + "@example.com",
  ])
    assert.equal(isValidEmail(input), false);
  assert.ok(isEndpointConfigured(endpoint));
  for (const input of [
    "",
    endpoint + "/extra",
    endpoint.replace("/exec", "/dev"),
    "https://example.com/exec",
  ])
    assert.equal(isEndpointConfigured(input), false);
});
test("participant persistence validates consent and re-prompts when remote collection is newly enabled", () => {
  const localPerson = { ...person, remoteConsent: false };
  const storage = { getItem: () => JSON.stringify(localPerson) };
  assert.deepEqual(readParticipant(storage, false), localPerson);
  assert.equal(readParticipant(storage, true), null);
  for (const p of [
    { ...person, consentAt: "invalid" },
    { ...person, email: "invalid" },
    { ...person, version: 0 },
  ])
    assert.equal(readParticipant({ getItem: () => JSON.stringify(p) }), null);
  assert.equal(
    readParticipant({
      getItem: () => {
        throw Error("blocked");
      },
    }),
    null,
  );
  assert.equal(
    saveParticipant(
      {
        setItem: () => {
          throw Error("blocked");
        },
      },
      person,
    ),
    false,
  );
  let savedKey = "";
  saveParticipant(
    {
      setItem: (key) => {
        savedKey = key;
      },
    },
    person,
  );
  assert.equal(savedKey, participantKey);
});
test("result payload uses the original round identity and consent, score, revisions, and a sanitized source", () => {
  const s = completedRound();
  const payload = buildResultPayload(
    s,
    { ...person, consentAt: "2026-02-01T00:00:00Z" },
    15,
    "https://example.com/hmi/?secret=private#arbitrary",
  );
  assert.equal(payload.score, 15);
  assert.equal(payload.total, 15);
  assert.equal(payload.appId, "ace-hmi-primer");
  assert.equal(payload.consentAt, person.consentAt);
  assert.equal(payload.sourceUrl, "https://example.com/hmi/#quiz");
  assert.equal(payload.questionRevisions.length, 15);
  assert.deepEqual(payload.incorrectQuestionIds, []);
  assert.equal(payload.sessionId, s.sessionId);
});
test("incomplete, mismatched, unconsented and stale-revision rounds cannot be submitted", () => {
  const s = completedRound();
  for (const bad of [
    { ...s, index: 14 },
    { ...s, participantEmail: "other@example.com" },
    { ...s, remoteConsent: false },
    { ...s, revisions: s.revisions.map(() => 0) },
  ])
    assert.throws(() =>
      buildResultPayload(bad, person, 15, "https://example.com"),
    );
  assert.throws(
    () => bindParticipant({ ...s, participantEmail: undefined }, person),
    /anonymous/,
  );
  assert.throws(
    () => bindParticipant(s, { ...person, email: "other@example.com" }),
    /another participant/,
  );
});
test("receiver acknowledgement must match the session; retry reuses the same session ID", async () => {
  const payload = buildResultPayload(
    completedRound(),
    person,
    15,
    "https://example.com",
  );
  let posted = "";
  const fetcher: typeof fetch = async (_input, init) => {
    posted = (init!.body as URLSearchParams).get("payload")!;
    return new Response(
      JSON.stringify({
        ok: true,
        sessionId: payload.sessionId,
        requestId: "receipt-1",
        duplicate: true,
      }),
      { status: 200 },
    );
  };
  const result = await submitResult(payload, endpoint, fetcher);
  assert.equal(result.status, "sent");
  assert.equal(result.requestId, "receipt-1");
  assert.match(result.message, /already stored/);
  assert.equal(JSON.parse(posted).sessionId, payload.sessionId);
  for (const response of [
    new Response(
      JSON.stringify({
        ok: false,
        error: "Permission denied",
        requestId: "error-1",
      }),
    ),
    new Response(JSON.stringify({ ok: true, sessionId: "wrong-session" })),
    new Response("<html>Sign in</html>"),
    { type: "opaque" } as Response,
  ]) {
    assert.equal(
      (await submitResult(payload, endpoint, async () => response)).status,
      "failed",
    );
  }
});
test("unconfigured endpoint sends nothing; network failure and timeout remain retryable", async () => {
  const payload = buildResultPayload(
    completedRound(),
    person,
    15,
    "https://example.com",
  );
  assert.equal(
    (
      await submitResult(payload, "", async () => {
        throw Error("must not be called");
      })
    ).status,
    "unavailable",
  );
  assert.equal(
    (
      await submitResult(payload, endpoint, async () => {
        throw Error("network");
      })
    ).status,
    "failed",
  );
  const stalled: typeof fetch = async (_input, init) =>
    new Promise((_resolve, reject) =>
      init!.signal!.addEventListener("abort", () => reject(Error("aborted"))),
    );
  assert.match(
    (await submitResult(payload, endpoint, stalled, 5)).message,
    /timed out/,
  );
});
test("interrupted or unverified delivery is restored as retryable, not successful", () => {
  for (const status of ["sending", "sent"] as const) {
    const s = { ...completedRound(), deliveryStatus: status };
    const restored = parseProgress(
      JSON.stringify({ version: 1, history: {}, session: s }),
    );
    assert.equal(restored.session!.deliveryStatus, "failed");
  }
});
