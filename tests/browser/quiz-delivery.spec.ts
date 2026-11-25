import { test, expect, type Page } from "@playwright/test";
import {
  answerQuiz,
  byId,
  emptyProgress,
  nextQuestion,
  startQuiz,
  storageKey,
} from "../../src/lib/quiz";
import {
  bindParticipant,
  participantKey,
  type Participant,
} from "../../src/lib/quiz-results";
const endpoint = "https://script.google.com/macros/s/HMI_TEST_ONLY/exec";
const person: Participant = {
  version: 1,
  email: "learner@example.com",
  consentAt: "2026-01-01T00:00:00Z",
  remoteConsent: true,
};
async function register(page: Page, email = person.email) {
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Start competency quiz" }).click();
}
function round(complete = true, remoteConsent = true) {
  let progress = startQuiz(emptyProgress());
  progress.session = bindParticipant(progress.session!, {
    ...person,
    remoteConsent,
  });
  if (complete)
    for (let i = 0; i < 15; i++)
      progress = nextQuestion(
        answerQuiz(progress, byId.get(progress.session!.ids[i]!)!.correctIndex),
      );
  return progress;
}
async function seed(page: Page, complete = true, remoteConsent = true) {
  await page.addInitScript(
    ({ progress, p, progressKey, personKey }) => {
      if (!sessionStorage.getItem("fixture-seeded")) {
        localStorage.setItem(progressKey, JSON.stringify(progress));
        localStorage.setItem(personKey, JSON.stringify(p));
        sessionStorage.setItem("fixture-seeded", "1");
      }
    },
    {
      progress: round(complete, remoteConsent),
      p: { ...person, remoteConsent },
      progressKey: storageKey,
      personKey: participantKey,
    },
  );
}
test("email and consent gate questions; changing participant creates a fresh identified round", async ({
  page,
}) => {
  await page.goto("/#quiz");
  await expect(
    page.getByRole("heading", { name: "Enter your email to begin" }),
  ).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await page.getByLabel("Email address").fill("not-an-email");
  await page.getByRole("button", { name: "Start competency quiz" }).click();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await page.getByLabel("Email address").fill(person.email);
  await page.getByRole("button", { name: "Start competency quiz" }).click();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Start competency quiz" }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  const before = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).session,
    storageKey,
  );
  await page.getByRole("button", { name: "Change email", exact: true }).click();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await register(page, "second@example.com");
  const after = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).session,
    storageKey,
  );
  expect(after.sessionId).not.toBe(before.sessionId);
  expect(after.participantEmail).toBe("second@example.com");
  expect(after.answers).toEqual({});
  await page.reload();
  await expect(page.locator(".participant-summary")).toContainText(
    "second@example.com",
  );
});
test("completed result receives a confirmed receipt and does not resend on reload", async ({
  page,
}) => {
  await seed(page);
  let calls = 0;
  let posted: any;
  await page.route(endpoint, async (route) => {
    calls++;
    posted = JSON.parse(
      new URLSearchParams(route.request().postData()!).get("payload")!,
    );
    await route.fulfill({
      json: { ok: true, sessionId: posted.sessionId, requestId: "receipt-123" },
    });
  });
  await page.goto("/#quiz");
  await expect(page.locator(".quiz-delivery")).toContainText(
    "Results storage confirmed",
  );
  expect(calls).toBe(1);
  expect(posted.email).toBe(person.email);
  expect(posted.score).toBe(15);
  expect(posted.questionRevisions).toHaveLength(15);
  await page.reload();
  await expect(page.locator(".quiz-delivery")).toContainText(
    "Results storage confirmed",
  );
  expect(calls).toBe(1);
});
test("rejection stays unconfirmed and retry preserves session identity", async ({
  page,
}) => {
  await seed(page);
  const ids: string[] = [];
  await page.route(endpoint, async (route) => {
    const data = JSON.parse(
      new URLSearchParams(route.request().postData()!).get("payload")!,
    );
    ids.push(data.sessionId);
    await route.fulfill({
      json:
        ids.length === 1
          ? {
              ok: false,
              error: "Spreadsheet permission denied",
              requestId: "error-123",
            }
          : {
              ok: true,
              sessionId: data.sessionId,
              duplicate: true,
              requestId: "retry-123",
            },
    });
  });
  await page.goto("/#quiz");
  await expect(page.locator(".quiz-delivery")).toContainText(
    "Spreadsheet permission denied",
  );
  await expect(page.locator(".quiz-delivery")).not.toContainText(
    "Results storage confirmed",
  );
  await page.getByRole("button", { name: "Retry result submission" }).click();
  await expect(page.locator(".quiz-delivery")).toContainText(
    "Results storage confirmed",
  );
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
});
test("newly enabled remote collection requires new consent and does not submit a local-only round", async ({
  page,
}) => {
  await seed(page, true, false);
  let calls = 0;
  await page.route(endpoint, async (route) => {
    calls++;
    await route.abort();
  });
  await page.goto("/#quiz");
  await expect(
    page.getByRole("heading", { name: "Enter your email to begin" }),
  ).toBeVisible();
  expect(calls).toBe(0);
  await register(page);
  await expect(page.locator("#question-title")).toBeVisible();
  expect(calls).toBe(0);
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).session,
    storageKey,
  );
  expect(saved.index).toBe(0);
  expect(saved.remoteConsent).toBe(true);
});
test("changing identity while a submission is pending cannot attach its receipt to the new round", async ({
  page,
}) => {
  await seed(page);
  let release!: () => void;
  const paused = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(endpoint, async (route) => {
    const data = JSON.parse(
      new URLSearchParams(route.request().postData()!).get("payload")!,
    );
    await paused;
    await route.fulfill({
      json: { ok: true, sessionId: data.sessionId, requestId: "old-receipt" },
    });
  });
  await page.goto("/#quiz");
  await expect(page.locator(".quiz-delivery")).toContainText("Sending results");
  await page.getByRole("button", { name: "Change email", exact: true }).click();
  await register(page, "second@example.com");
  release();
  await expect(page.locator("#question-title")).toBeVisible();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).session,
    storageKey,
  );
  expect(saved.participantEmail).toBe("second@example.com");
  expect(saved.deliveryStatus).toBeUndefined();
});
