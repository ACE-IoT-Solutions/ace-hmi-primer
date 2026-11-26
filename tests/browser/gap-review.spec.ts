import { test, expect, type Page } from "@playwright/test";
async function exercise(page: Page, value: string) {
  await page.goto("/#lab");
  await page
    .getByRole("combobox", { name: "Lab exercise", exact: true })
    .selectOption(value);
}
test("phase 0: stale history leaves a visible gap through now and unit changes share data", async ({
  page,
}) => {
  await page.goto("/#lab");
  await page.getByLabel("Process scenario").selectOption("stale");
  const chart = page.locator(".operating-card .trend-panel");
  await expect(chart.locator(".missing-data-region")).toBeVisible();
  await expect(chart.locator("circle")).toHaveAttribute("cx", "306");
  await expect(chart).toContainText("Now");
  await expect(chart).toContainText("12 min ago");
  await page
    .getByRole("combobox", { name: "Temperature units", exact: true })
    .selectOption("F");
  await expect(page.locator(".operating-card .measurement")).toContainText(
    "65.3",
  );
  await page.getByRole("button", { name: "LEVEL 3 Detail" }).click();
  await expect(page.locator(".hierarchy-detail")).toContainText(
    "freeze interlock",
  );
  await page.getByRole("button", { name: "LEVEL 4 Diagnostics" }).click();
  await expect(page.locator(".hierarchy-detail")).toContainText(
    "operating procedure",
  );
  await page.goto("/#learn/lifecycle");
  await expect(page.locator(".requirement-card li")).toHaveCount(6);
});
test("S1: acknowledge stops alarm border motion but preserves the active condition and level cues", async ({
  page,
}) => {
  await exercise(page, "alarms");
  await expect(page.locator(".alarm-item")).toHaveCount(1);
  const alarm = page.locator(".alarm-item").first();
  await expect(alarm).toHaveClass(/alarm-unacknowledged/);
  await alarm.getByRole("button", { name: "Acknowledge", exact: true }).click();
  await expect(alarm).not.toHaveClass(/alarm-unacknowledged/);
  await expect(alarm).toContainText("ACTIVE");
  await expect(alarm).toContainText("Acknowledged");
  await page
    .getByRole("combobox", { name: "Display level", exact: true })
    .selectOption("2");
  await expect(page.locator(".alarm-item")).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "Open equipment detail" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open equipment detail" }).click();
  await expect(page.locator(".alarm-item")).toHaveCount(3);
  await expect(page.locator(".maintenance-alert")).toContainText(
    "Filter maintenance due",
  );
});
test("S2–S3: both displays expose overrides, and delayed rejection never updates the target", async ({
  page,
}) => {
  await page.goto("/#lab");
  await page.getByLabel("Process scenario").selectOption("override");
  for (const selector of [".mimic-card", ".operating-card"]) {
    await expect(page.locator(selector)).toContainText("Priority 8");
    await expect(page.locator(selector)).toContainText(
      "Effective valve command 0%",
    );
  }
  await page.getByLabel("Requested cooling valve command").fill("18");
  await page
    .getByRole("button", { name: "Review change", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm simulated change" }).click();
  await expect(page.locator("#target-feedback")).toContainText("PENDING");
  await expect(page.locator(".operating-card .measurement")).toContainText(
    "16.0",
  );
  await expect(page.locator("#target-feedback")).toContainText("REJECTED");
  await expect(page.locator(".operating-card .measurement")).toContainText(
    "16.0",
  );
  await page
    .getByRole("combobox", { name: "Lab exercise", exact: true })
    .selectOption("writes");
  await page
    .getByRole("button", { name: "Release simulated override" })
    .click();
  await page.getByLabel("Requested cooling valve command").fill("40");
  await page
    .getByRole("button", { name: "Review change", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm simulated change" }).click();
  await expect(page.locator("#target-feedback")).toContainText("ACCEPTED");
  await expect(page.locator(".command-demo")).toContainText("40.0%");
  await page
    .getByRole("combobox", { name: "Lab exercise", exact: true })
    .selectOption("comparison");
  await expect(
    page.locator(".operating-card .operating-signals"),
  ).toContainText("40%");
});
test("S4–S5: whole-display failure remains obvious while motion continues; notification paths are monitored", async ({
  page,
}) => {
  await page.goto("/#lab");
  await page.getByLabel("Process scenario").selectOption("disconnected");
  await expect(page.locator(".mimic-card .display-failure")).toContainText(
    "All process values retained",
  );
  await expect(page.locator(".operating-card .display-failure")).toContainText(
    "current process state unknown",
  );
  await expect(page.locator(".fan-rotor")).toHaveCSS(
    "animation-play-state",
    "running",
  );
  await page
    .getByRole("combobox", { name: "Lab exercise", exact: true })
    .selectOption("connection");
  await page
    .getByRole("button", { name: "Test simulated notification" })
    .click();
  await expect(
    page.locator(".exercise-panel").last().getByRole("status"),
  ).toContainText("failed silently");
  await page.getByLabel("Monitor notification-service availability").check();
  await page.getByLabel("Configure an independent backup call route").check();
  await expect(
    page.locator(".exercise-panel").last().getByRole("status"),
  ).toContainText("backup call route used");
});
test("S6: formatting repairs, distinct actions and popup focus/timeout controls work", async ({
  page,
}) => {
  await exercise(page, "formatting");
  await expect(page.locator(".clinic-values")).toContainText(".5");
  await page.getByLabel("Repair numeric presentation").check();
  await expect(page.locator(".clinic-values")).toContainText("0.5");
  await page.getByLabel("Use readable task language").check();
  await expect(page.locator(".clinic-values")).toContainText(
    "Occupied cooling supply-temperature target",
  );
  await page.getByLabel("Distinguish navigation and process actions").check();
  await page.getByRole("button", { name: "Open sensor details" }).click();
  await expect(page.getByRole("status")).toContainText("No process command");
  await page
    .getByRole("button", { name: "Open faceplate", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeFocused();
  await page.getByRole("button", { name: "Extend timeout" }).click();
  await expect(page.getByRole("dialog")).toContainText("24 seconds");
  await page.getByRole("button", { name: "Move faceplate" }).click();
  await expect(page.getByRole("dialog")).toHaveClass(/popup-moved/);
  await page.getByRole("button", { name: "Close faceplate" }).click();
});
test("S7: batch changes confirm a fixed list, cancel, undo, enforce role and require exception reasons", async ({
  page,
}) => {
  await exercise(page, "batch");
  await page
    .getByRole("button", { name: "Review unoccupied mode change" })
    .click();
  await expect(page.locator(".notice li")).toHaveCount(3);
  await page.getByRole("button", { name: "Cancel batch change" }).click();
  await expect(page.locator(".batch-equipment")).not.toContainText(
    "Unoccupied",
  );
  await page
    .getByRole("button", { name: "Review unoccupied mode change" })
    .click();
  await page.getByRole("button", { name: "Confirm listed AHUs" }).click();
  await expect(page.locator(".batch-equipment")).toContainText("Unoccupied");
  await page.getByRole("button", { name: "Undo last mode change" }).click();
  await expect(page.locator(".batch-equipment")).not.toContainText(
    "Unoccupied",
  );
  await page.getByLabel("Exceptional temperature target").fill("22");
  await page.getByRole("button", { name: "Record exceptional entry" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "requires a recorded reason",
  );
  await page
    .getByLabel("Reason for exception")
    .fill("Authorized diagnostic trial");
  await page.getByRole("button", { name: "Record exceptional entry" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Authorized diagnostic trial",
  );
  await page
    .getByRole("combobox", { name: "User role", exact: true })
    .selectOption("viewer");
  await expect(
    page.getByRole("button", { name: "Review unoccupied mode change" }),
  ).toBeDisabled();
});
test("S8–S9: style selection and relational/yoked navigation serve distinct tasks", async ({
  page,
}) => {
  await exercise(page, "styles");
  await page.getByLabel("Operator task").selectOption("2");
  await page
    .getByRole("combobox", { name: "Display style", exact: true })
    .selectOption("Health/Diagnostic");
  await page.getByRole("button", { name: "Review style choice" }).click();
  await expect(page.getByRole("status")).toContainText("A strong match");
  await page
    .getByRole("combobox", { name: "Lab exercise", exact: true })
    .selectOption("navigation");
  await page.getByLabel("Navigation design").selectOption("relational");
  await page.getByLabel("Yoke the AHU faceplate and trend").check();
  await page.getByRole("button", { name: "Open AHU-01", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "AHU-01 faceplate" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "AHU-01 trend" }),
  ).toBeVisible();
});
test("S10–S12: viewing context, local timing records and lifecycle review work on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await exercise(page, "viewing");
  await page.getByLabel("Working device").selectOption("night");
  await page.getByLabel("Color-view approximation").selectOption("deutan");
  await expect(page.locator(".viewing-surround")).toHaveClass(/night/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("combobox", { name: "Lab exercise", exact: true })
    .selectOption("timing");
  await page.getByLabel("Test display").selectOption("task");
  await page.getByRole("button", { name: "Start timed run" }).click();
  await page.getByRole("button", { name: "Mark condition detected" }).click();
  await page
    .getByRole("combobox", { name: "Diagnosis", exact: true })
    .selectOption("rising");
  await page.getByRole("button", { name: "Record diagnosis" }).click();
  await page
    .getByLabel("Appropriate next response")
    .fill("Investigate cooling response under the operating procedure.");
  await page.getByRole("button", { name: "Finish and save locally" }).click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("ace-hmi-usability-runs-v1")!).length,
    ),
  ).toBe(1);
  await page
    .getByRole("combobox", { name: "Lab exercise", exact: true })
    .selectOption("lifecycle");
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("checkbox").nth(2).check();
  await page.getByRole("button", { name: "Review lifecycle actions" }).click();
  await expect(page.getByRole("status")).toContainText(
    "necessary review actions",
  );
});
