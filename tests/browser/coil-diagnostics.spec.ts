import { test, expect } from "@playwright/test";

test("coil diagnostics distinguish valve travel, warm water and unverified feedback in both contextual views", async ({
  page,
}) => {
  await page.goto("/#lab");
  for (const view of ["Task-focused display", "3D with operating context"]) {
    await page.getByRole("radio", { name: view, exact: false }).check();
    await page.getByLabel("Process scenario").selectOption("valve-stuck");
    await expect(page.locator(".comparison-card .valve-proof")).toContainText(
      "Valve command / position mismatch",
    );
    await expect(page.locator(".comparison-card .valve-proof")).toContainText(
      "Effective command 92% / Position feedback 5%",
    );
    await expect(
      page.locator(".comparison-card .water-diagnostics"),
    ).toContainText("6.0 °C");
    await expect(
      page.locator(".comparison-card .water-diagnostics"),
    ).toContainText("18.0 °C");
    await expect(
      page.locator(".comparison-card .water-diagnostics"),
    ).toContainText("12.0 °C");
    await page.getByLabel("Process scenario").selectOption("warm-water");
    await expect(page.locator(".comparison-card .valve-proof")).toContainText(
      "Valve position tracks command",
    );
    await expect(
      page.locator(".comparison-card .water-diagnostics"),
    ).toContainText("Entering water above example supply range");
    await expect(
      page.locator(".comparison-card .water-diagnostics"),
    ).toContainText("18.0 °C");
    await page.getByLabel("Process scenario").selectOption("feedback-lost");
    await expect(page.locator(".comparison-card .valve-proof")).toContainText(
      "Current valve tracking unknown",
    );
    await expect(page.locator(".comparison-card .valve-proof")).toContainText(
      "STALE · sample age 720 s",
    );
    await expect(page.locator(".comparison-card .proof-mismatch")).toHaveCount(
      0,
    );
    await page.getByLabel("Process scenario").selectOption("disconnected");
    await expect(
      page.locator(".comparison-card .water-diagnostics"),
    ).toContainText("Unknown · current pair unavailable");
    await expect(page.locator(".comparison-card .valve-proof")).toContainText(
      "Position quality: UNKNOWN",
    );
  }
});

test("water diagnostics convert temperatures and temperature differences correctly on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#lab");
  await page.getByLabel("Process scenario").selectOption("valve-stuck");
  await page
    .getByRole("combobox", { name: "Temperature units", exact: true })
    .selectOption("F");
  for (const view of ["Task-focused display", "3D with operating context"]) {
    await page.getByRole("radio", { name: view, exact: false }).check();
    await expect(
      page.locator(".comparison-card .water-diagnostics"),
    ).toContainText("42.8 °F");
    await expect(
      page.locator(".comparison-card .water-diagnostics"),
    ).toContainText("64.4 °F");
    await expect(
      page.locator(".comparison-card .water-diagnostics"),
    ).toContainText("21.6 °F");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
