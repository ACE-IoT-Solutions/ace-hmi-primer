import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import vm from "node:vm";
import {
  answerQuiz,
  byId,
  emptyProgress,
  nextQuestion,
  startQuiz,
} from "../src/lib/quiz";
import {
  bindParticipant,
  buildResultPayload,
  type Participant,
} from "../src/lib/quiz-results";

const person: Participant = {
  version: 1,
  email: "learner@example.com",
  consentAt: "2026-01-01T00:00:00Z",
  remoteConsent: true,
};
function payload() {
  let p = startQuiz(emptyProgress());
  p.session = bindParticipant(p.session!, person);
  for (let i = 0; i < 15; i++)
    p = nextQuestion(answerQuiz(p, byId.get(p.session!.ids[i]!)!.correctIndex));
  return buildResultPayload(
    p.session!,
    person,
    15,
    "https://example.com/hmi/#quiz",
  );
}
function receiver() {
  const rows: unknown[][] = [];
  const properties: Record<string, string> = {};
  const external: { url: string; options: any }[] = [];
  let locks = 0,
    flushes = 0,
    failCrm = false,
    storageFailure = false;
  const sheet: any = {
    getName: () => "HMI Quiz Results",
    getLastRow: () => rows.length,
    setFrozenRows: () => {},
    appendRow: (row: unknown[]) => {
      rows.push(row);
    },
    getRange: (r: number, c: number, n = 1, w = 1) => ({
      setValues: (values: unknown[][]) => {
        values.forEach((line, i) => {
          rows[r - 1 + i] ??= [];
          line.forEach((value, j) => {
            rows[r - 1 + i]![c - 1 + j] = value;
          });
        });
      },
      getValues: () =>
        Array.from({ length: n }, (_, i) =>
          Array.from(
            { length: w },
            (_, j) => rows[r - 1 + i]?.[c - 1 + j] ?? "",
          ),
        ),
      setFontWeight: () => {},
      createTextFinder: (id: string) => ({
        matchEntireCell: () => ({
          findNext: () => {
            const index = rows.findIndex(
              (row, i) => i > 0 && row[c - 1] === id,
            );
            return index < 0 ? null : { getRow: () => index + 1 };
          },
        }),
      }),
    }),
  };
  const spreadsheet: any = {
    getId: () => "configured-workbook",
    getName: () => "Learning Records",
    getUrl: () => "https://docs.google.com/spreadsheets/d/configured-workbook",
    getSheetByName: () => (rows.length ? sheet : null),
    insertSheet: () => sheet,
  };
  const context = vm.createContext({
    console: { log: () => {} },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => properties[key] ?? null,
        setProperty: (key: string, value: string) => {
          properties[key] = value;
        },
      }),
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => {
        if (storageFailure) throw Error("Spreadsheet permission denied.");
        return spreadsheet;
      },
      flush: () => {
        flushes++;
      },
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {
          locks++;
        },
        releaseLock: () => {
          locks--;
        },
      }),
    },
    Utilities: { getUuid: () => "request-1234" },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (value: string) => ({
        setMimeType: () => JSON.parse(value),
      }),
    },
    UrlFetchApp: {
      fetch: (url: string, options: any) => {
        external.push({ url, options });
        if (failCrm) throw Error("CRM down");
        return {
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              success: true,
              data: url.includes("/search")
                ? { items: [{ item: { id: 42 } }] }
                : { id: 42 },
            }),
        };
      },
    },
  });
  vm.runInContext(
    fs.readFileSync("integrations/google-apps-script/Code.gs", "utf8"),
    context,
  );
  return {
    context,
    rows,
    properties,
    external,
    get locks() {
      return locks;
    },
    get flushes() {
      return flushes;
    },
    set failCrm(value: boolean) {
      failCrm = value;
    },
    set storageFailure(value: boolean) {
      storageFailure = value;
    },
  };
}
test("unchanged receiver accepts future question IDs, revisions, bank sizes and round lengths", () => {
  for (const total of [5, 15, 30]) {
    const app = receiver();
    app.context.setupQuizResults();
    const data = payload();
    data.questionIds = Array.from(
      { length: total },
      (_, i) => `future-vav-2030:${i}`,
    );
    data.answers = Object.fromEntries(data.questionIds.map((id) => [id, 2]));
    data.questionRevisions = data.questionIds.map(() => 99);
    data.bankVersion = 99;
    data.masteredTotal = 10000;
    data.total = total;
    data.score = total - 1;
    data.percentage = Number(((data.score / total) * 100).toFixed(1));
    data.incorrectQuestionIds = data.questionIds.slice(-1);
    const result = app.context.doPost({
      parameter: { payload: JSON.stringify(data) },
    });
    assert.equal(result.ok, true, result.error);
    assert.equal(app.rows[1]![4], total);
    assert.equal(app.rows[1]![6], 10000);
    assert.equal(app.rows[1]![9], 99);
    assert.deepEqual(JSON.parse(String(app.rows[1]![10])), data.questionIds);
  }
});
test("receiver stays scoped to its directly attached spreadsheet", () => {
  const manifest = JSON.parse(
    fs.readFileSync("integrations/google-apps-script/appsscript.json", "utf8"),
  );
  assert.deepEqual(manifest.oauthScopes, [
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/script.external_request",
  ]);
  const code = fs.readFileSync(
    "integrations/google-apps-script/Code.gs",
    "utf8",
  );
  assert.match(code, /@OnlyCurrentDoc/);
  assert.doesNotMatch(code, /openById|openByUrl|SPREADSHEET_ID/);
});
test("setup and health check use the bound workbook without a spreadsheet ID property", () => {
  const app = receiver();
  app.context.setupQuizResults();
  assert.equal(app.properties.SPREADSHEET_ID, undefined);
  assert.equal(app.rows[0]![2], "Email");
  const health = app.context.doGet();
  assert.equal(health.ok, true);
  assert.equal(health.storage, "bound_workbook");
  assert.equal(health.receiverVersion, "2026-11-26.1");
  assert.equal(health.resultSchemaVersion, 1);
  assert.equal(health.questionBankIndependent, true);
  assert.equal(health.questionCount, undefined);
  assert.equal(health.questionIds, undefined);
});
test("standalone receiver accepts a mixed 12/15 practice result with app-calculated scoring", () => {
  const app = receiver();
  app.context.setupQuizResults();
  const data = payload();
  data.incorrectQuestionIds = data.questionIds.slice(-3);
  for (const id of data.incorrectQuestionIds)
    data.answers[id] = (data.answers[id]! + 1) % 4;
  data.score = 12;
  data.percentage = 80;
  const result = app.context.doPost({
    parameter: { payload: JSON.stringify(data) },
  });
  assert.equal(result.ok, true);
  assert.equal(app.rows[1]![3], 12);
  assert.equal(app.rows[1]![5], 80);
  assert.equal(JSON.parse(String(app.rows[1]![12])).length, 3);
});
test("receiver writes one consent-bearing row and deduplicates a retried session under lock", () => {
  const app = receiver();
  app.context.setupQuizResults();
  const data = payload();
  const event = { parameter: { payload: JSON.stringify(data) } };
  const first = app.context.doPost(event),
    second = app.context.doPost(event);
  assert.equal(first.ok, true);
  assert.equal(second.duplicate, true);
  assert.equal(first.requestId, "request-1234");
  assert.equal(app.rows.length, 2);
  assert.equal(app.rows[1]![17], data.consentAt);
  assert.equal(app.rows[1]![19], "ace-hmi-primer");
  assert.equal(app.rows[1]![15], "not_configured");
  assert.equal(app.locks, 0);
  assert.ok(app.flushes > 0);
});
test("receiver rejects malformed records, inconsistent scores, spam and invalid consent before writing", () => {
  const app = receiver();
  app.context.setupQuizResults();
  const data = payload();
  for (const edit of [
    { appId: "ace-cdl-explorer" },
    { website: "spam" },
    {
      score: 14,
      percentage: 93.3,
      incorrectQuestionIds: [],
    },
    { questionRevisions: data.questionRevisions.map(() => 0) },
    { total: 0 },
    { total: 501 },
    { percentage: 80 },
    { masteredTotal: -1 },
    { bankVersion: 0 },
    { questionIds: data.questionIds.map(() => data.questionIds[0]) },
    { answers: { ...data.answers, unexpected: 0 } },
    { questionRevisions: [] },
    { consentAt: "invalid" },
    { questionIds: data.questionIds.slice(1) },
    { answers: { ...data.answers, [data.questionIds[0]!]: 7 } },
  ])
    assert.equal(
      app.context.doPost({
        parameter: { payload: JSON.stringify({ ...data, ...edit }) },
      }).ok,
      false,
    );
  assert.equal(
    app.context.doPost({ parameter: { payload: "x".repeat(50001) } }).ok,
    false,
  );
  assert.equal(
    app.context.doPost({ parameter: { payload: "{invalid" } }).ok,
    false,
  );
  assert.equal(app.rows.length, 1);
});
test("storage errors are observable and never become successful receipts", () => {
  const app = receiver();
  assert.equal(app.context.doGet().ok, false);
  app.context.setupQuizResults();
  app.storageFailure = true;
  const result = app.context.doPost({
    parameter: { payload: JSON.stringify(payload()) },
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /permission denied/);
  assert.equal(app.rows.length, 1);
  assert.equal(app.locks, 0);
});
test("optional Pipedrive uses token headers, matching contact and note; retries create no second note", () => {
  const app = receiver();
  app.context.setupQuizResults();
  app.properties.PIPEDRIVE_COMPANY_DOMAIN = "example";
  app.properties.PIPEDRIVE_API_TOKEN = "server-only-token";
  const event = { parameter: { payload: JSON.stringify(payload()) } };
  assert.equal(app.context.doPost(event).ok, true);
  app.context.doPost(event);
  assert.equal(app.external.length, 2);
  assert.match(app.external[0]!.url, /\/api\/v2\/persons\/search/);
  assert.match(app.external[1]!.url, /\/api\/v1\/notes/);
  assert.equal(
    app.external[0]!.options.headers["x-api-token"],
    "server-only-token",
  );
  assert.ok(
    app.external.every((request) => !request.url.includes("server-only-token")),
  );
  assert.equal(app.rows[1]![15], "matched_and_noted");
});
test("Pipedrive failure preserves Sheet success and formula-like email is stored as text", () => {
  const app = receiver();
  app.context.setupQuizResults();
  app.properties.PIPEDRIVE_COMPANY_DOMAIN = "example";
  app.properties.PIPEDRIVE_API_TOKEN = "server-only-token";
  app.failCrm = true;
  const data = payload();
  data.email = "=learner@example.com";
  assert.equal(
    app.context.doPost({ parameter: { payload: JSON.stringify(data) } }).ok,
    true,
  );
  assert.equal(app.rows[1]![2], "'=learner@example.com");
  assert.equal(app.rows[1]![15], "failed");
});
