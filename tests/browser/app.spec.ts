import { test, expect } from "@playwright/test";

test("lesson navigation, completion, glossary search, and history work", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Good displays. Better decisions." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mark lesson complete", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Marked complete", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next lesson", exact: true }).click();
  await expect(page.locator("#lesson-content h2")).toHaveText(
    "Build a system that can be maintained",
  );
  await page.getByRole("link", { name: "Glossary", exact: true }).click();
  await page.getByRole("searchbox").fill("salience");
  await expect(page.locator("dt")).toHaveCount(1);
  await expect(page.locator("dt")).toHaveText("Salience");
  await page.goBack();
  await expect(page.locator("#lesson-content h2")).toHaveText(
    "Build a system that can be maintained",
  );
});
test("lab distinguishes stale state and separates accepted target from actual temperature", async ({
  page,
}) => {
  await page.goto("/#lab");
  await expect(page.locator(".screen-status")).toContainText(
    "SUPPLY TEMPERATURE HIGH",
  );
  await page.getByLabel("Process scenario").selectOption("stale");
  await expect(page.locator(".screen-status")).toContainText(
    "Current temperature unknown",
  );
  await page.getByLabel("View in grayscale").check();
  await expect(page.locator(".screen-status")).toContainText("STALE DATA");
  await page.getByLabel("Requested supply temperature").fill("30");
  await page
    .getByRole("button", { name: "Review change", exact: true })
    .click();
  await expect(page.locator(".error-text")).toContainText("12 and 20");
  await page.getByLabel("Requested supply temperature").fill("18");
  await page
    .getByRole("button", { name: "Review change", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator("#target-feedback")).toContainText(
    "No command sent",
  );
  await expect(page.locator(".measurement")).toContainText("16.0");
  await page
    .getByRole("button", { name: "Review change", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm simulated change", exact: true })
    .click();
  await expect(page.locator(".measurement")).toContainText("18.0");
  await expect(page.locator(".measurement")).toContainText("18.5");
  await page.getByRole("button", { name: "LEVEL 4 Diagnostics" }).click();
  await expect(
    page.getByRole("heading", { name: "Can I trust this observation?" }),
  ).toBeVisible();
});
test("quiz answer locks, survives reload and lesson review, completes and exports", async ({
  page,
}) => {
  await page.goto("/#quiz");
  await page.getByLabel("Email address").fill("learner@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Start competency quiz" }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  const prompt = await page.locator("#question-title").textContent();
  await page.reload();
  await expect(page.locator("#question-title")).toHaveText(prompt!);
  await expect(page.getByRole("radio").first()).toBeDisabled();
  await page
    .getByRole("button", { name: "Review the lesson", exact: true })
    .click();
  await expect(page.locator("#lesson-content")).toBeVisible();
  await page.getByRole("link", { name: "Quiz", exact: true }).click();
  await expect(page.locator("#question-title")).toHaveText(prompt!);
  for (let i = 0; i < 15; i++) {
    if (i > 0) {
      await page.getByRole("radio").first().check();
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
    }
    await page
      .getByRole("button", {
        name: i === 14 ? "See results" : "Next question",
        exact: true,
      })
      .click();
  }
  await expect(page.getByText("ROUND COMPLETE", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download result", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("hmi-practice-result.json");
  await page
    .getByRole("button", { name: "Reset quiz progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Keep progress", exact: true })
    .click();
  await expect(page.getByText("ROUND COMPLETE", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Reset quiz progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear quiz progress", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Start a 15-question round" }),
  ).toBeVisible();
});
test("mobile layouts have no horizontal document overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["learn", "lab", "quiz", "glossary", "review"]) {
    await page.goto(`/#${path}`);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
test("storage failure still allows quiz use and explains persistence limit", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  await page.goto("/#quiz");
  await page.getByLabel("Email address").fill("learner@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Start competency quiz" }).click();
  await expect(
    page.getByText("Progress could not be saved.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Next question", exact: true }),
  ).toBeVisible();
  const prompt = await page.locator("#question-title").textContent();
  await page
    .getByRole("button", { name: "Review the lesson", exact: true })
    .click();
  await page.getByRole("link", { name: "Quiz", exact: true }).click();
  await expect(page.locator("#question-title")).toHaveText(prompt!);
  await expect(page.getByRole("radio").first()).toBeDisabled();
});
