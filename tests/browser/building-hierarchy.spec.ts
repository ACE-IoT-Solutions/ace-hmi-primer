import { test, expect, type Page } from "@playwright/test";
async function openHierarchy(page: Page) {
  await page.goto("/#lab");
  await page
    .getByRole("combobox", { name: "Lab exercise", exact: true })
    .selectOption("hierarchy");
}
test("building problem drills through four different jobs while retaining its case and context", async ({
  page,
}) => {
  await openHierarchy(page);
  await page.getByLabel("Building case").selectOption("valve-stuck");
  await expect(page.locator(".building-overview")).toContainText(
    "Valve command / position mismatch",
  );
  await expect(page.getByLabel("Requested supply temperature")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Investigate West air service" })
    .click();
  await expect(page.locator(".building-operation")).toContainText("92% / 5%");
  await expect(page.locator(".service-path")).toContainText("Floors 1–2");
  await page
    .getByRole("button", { name: "Investigate AHU-01 cooling subsystem" })
    .click();
  await expect(page.locator(".equipment-evidence .valve-proof")).toContainText(
    "position mismatch",
  );
  await expect(
    page.locator(".equipment-evidence .water-diagnostics"),
  ).toContainText("18.0 °C");
  await page
    .getByRole("button", { name: "Inspect valve position point" })
    .click();
  await expect(page.locator(".point-faceplate")).toContainText("AHU01.CLV.POS");
  await expect(page.locator(".point-metadata")).toContainText("GOOD");
  await expect(page.locator(".point-metadata")).toContainText("5 s");
  await expect(page.locator(".point-procedures")).toContainText(
    "Freeze safety shutdown",
  );
  await expect(page.getByLabel("Building case")).toHaveValue("valve-stuck");
  await expect(
    page.getByRole("navigation", { name: "Current building display path" }),
  ).toContainText("Campus responsibility");
  await page
    .getByRole("button", { name: "West air service", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "LEVEL 2 Operation" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "LEVEL 1 Overview" }).click();
  await page.getByLabel("Building case").selectOption("cascade");
  await expect(page.locator(".overview-alarm")).toContainText(
    "HIGH · Chiller-01 · Chiller trip · Unacknowledged",
  );
  await expect(page.locator(".building-dependency")).toContainText(
    "Central plant / chilled water",
  );
});
test("single-building responsibility still supports all four levels and stale point evidence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHierarchy(page);
  await page.getByLabel("Operator responsibility").selectOption("building");
  await page.getByLabel("Building case").selectOption("feedback-lost");
  await expect(page.locator(".hierarchy-scope")).toContainText(
    "West building operator",
  );
  await page.getByRole("button", { name: "LEVEL 3 Detail" }).click();
  await expect(page.locator(".equipment-evidence")).toContainText(
    "Current valve tracking unknown",
  );
  await page
    .getByRole("button", { name: "Inspect valve position point" })
    .click();
  await expect(page.locator(".point-metadata")).toContainText("STALE");
  await expect(page.locator(".point-metadata")).toContainText("720 s");
  await page.getByLabel("Diagnostic point").selectOption("enteringWater");
  await page
    .getByRole("combobox", { name: "Temperature units", exact: true })
    .selectOption("F");
  await expect(page.locator(".point-faceplate")).toContainText("42.8 °F");
  await expect(page.locator(".point-metadata")).toContainText("GOOD");
  await page.getByLabel("Building case").selectOption("disconnected");
  await expect(page.locator(".point-faceplate")).toContainText(
    "current value unknown",
  );
  await expect(page.locator(".point-metadata")).toContainText("UNKNOWN");
  await expect(page.locator(".point-procedures")).toContainText(
    "unknown · display disconnected",
  );
  await page.getByRole("button", { name: "LEVEL 1 Overview" }).click();
  await expect(page.locator(".building-overview")).toContainText(
    "Current service unknown",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByText("Apply the four jobs to other building systems", { exact: true })
    .click();
  await expect(page.getByRole("table")).toContainText(
    "School heating-loop operating display",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("routine target changes live at the operating level and preserve the measurement through navigation", async ({
  page,
}) => {
  await openHierarchy(page);
  await page.getByRole("button", { name: "LEVEL 2 Operation" }).click();
  await page
    .getByText("Routine controls · review a target change", { exact: true })
    .click();
  await page.getByLabel("Requested supply temperature").fill("18");
  await page
    .getByRole("button", { name: "Review change", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm simulated change", exact: true })
    .click();
  await page.getByRole("button", { name: "LEVEL 3 Detail" }).click();
  await expect(page.locator(".hierarchy-write-state")).toContainText(
    "accepted",
  );
  await page.getByRole("button", { name: "LEVEL 2 Operation" }).click();
  await expect(page.locator(".service-values")).toContainText("18.0 °C");
  await expect(page.locator(".service-values")).toContainText("24.4 °C");
  await page.getByRole("button", { name: "LEVEL 1 Overview" }).click();
  await expect(page.locator(".building-overview")).toContainText(
    "target 18.0 °C",
  );
  await page.getByRole("button", { name: "LEVEL 4 Diagnostics" }).click();
  await page.getByLabel("Diagnostic point").selectOption("supplyTemperature");
  await expect(page.locator(".point-value")).toHaveText("24.4 °C");
});
