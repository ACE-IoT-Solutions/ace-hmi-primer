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
  await expect(page.locator(".building-equipment-detail")).toContainText(
    "Valve command / position mismatch",
  );
  await expect(page.locator(".equipment-evidence")).toContainText("18.0 °C");
  await page
    .getByRole("button", { name: "Inspect valve position point", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "AHU-01 point diagnostics" }),
  ).toContainText("AHU01.CLV.POS");
  await expect(page.locator(".point-metadata")).toContainText("GOOD");
  await expect(page.locator(".point-metadata")).toContainText("5 s");
  await page.getByRole("button", { name: "Interlocks", exact: true }).click();
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
  await expect(page.locator(".building-equipment-detail")).toContainText(
    "Current valve tracking unknown",
  );
  await page
    .getByRole("button", { name: "Inspect valve position point", exact: true })
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
  await page.getByRole("button", { name: "Interlocks", exact: true }).click();
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
  await expect(
    page.getByRole("table", { name: /Illustrative mappings/ }),
  ).toContainText("School heating-loop operating display");
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
    .getByRole("button", { name: "Open supply temperature controller" })
    .click();
  await page.getByLabel("Requested supply temperature").fill("18");
  await page
    .getByRole("button", { name: "Review change", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm target", exact: true })
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

test("operator graphics provide keyboard drill-down, a point overlay and a working event tray", async ({
  page,
}) => {
  await openHierarchy(page);
  await page.getByLabel("Building case").selectOption("cascade");
  await page.getByRole("button", { name: /Events & alarms/ }).click();
  await expect(page.getByLabel("Workstation event tray")).toContainText(
    "Chiller trip",
  );
  const chiller = page
    .getByLabel("Workstation event tray")
    .getByRole("row")
    .filter({ hasText: "Chiller trip" });
  await chiller
    .getByRole("button", { name: "Acknowledge", exact: true })
    .click();
  await expect(
    chiller.getByRole("button", { name: "Acknowledged", exact: true }),
  ).toBeDisabled();
  await expect(chiller).toContainText("ACTIVE");
  await page.getByRole("button", { name: /Events & alarms/ }).click();
  await page
    .getByRole("button", { name: "Workstation: West air systems", exact: true })
    .click();
  const sensor = page.getByRole("button", {
    name: "Inspect supply temperature point from air schematic",
    exact: true,
  });
  await sensor.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "AHU-01 point diagnostics" }),
  ).toBeVisible();
  await expect(page.locator(".point-value")).toHaveText("24.4 °C");
  await expect(page.locator(".ws-diagnostic-background")).toHaveAttribute(
    "inert",
    "",
  );
  await page.getByRole("button", { name: "Procedure", exact: true }).click();
  await expect(page.locator(".point-procedures")).toContainText(
    "Verify actuator",
  );
  await page.getByRole("button", { name: "Close point inspector" }).click();
  await expect(
    page.getByRole("button", {
      name: "Workstation: AHU-01 cooling circuit",
      exact: true,
    }),
  ).toHaveAttribute("aria-current", "page");
  const valve = page.getByRole("button", {
    name: "Inspect valve position point",
    exact: true,
  });
  await valve.focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".point-metadata")).toContainText("AHU01.CLV.POS");
  await expect(page.locator(".operator-workstation")).not.toContainText(
    "The levels describe",
  );
});
test("light workstation controls stay readable when enabled and disabled and a disconnected write is rejected", async ({
  page,
}) => {
  await openHierarchy(page);
  await page.getByLabel("Building case").selectOption("disconnected");
  await page
    .getByRole("button", { name: "Workstation: West air systems", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open supply temperature controller" })
    .click();
  const review = page.getByRole("button", {
    name: "Review change",
    exact: true,
  });
  const contrast = async () =>
    review.evaluate((element) => {
      const style = getComputedStyle(element);
      const luminance = (color: string) => {
        const rgb = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((n) => {
            const c = n / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
        return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
      };
      const a = luminance(style.color),
        b = luminance(style.backgroundColor);
      return {
        ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        opacity: style.opacity,
      };
    });
  expect((await contrast()).ratio).toBeGreaterThanOrEqual(4.5);
  await page.getByLabel("Requested supply temperature").fill("30");
  await review.click();
  await expect(page.getByRole("alert")).toContainText("Enter 12.0 °C–20.0 °C");
  await page.getByLabel("Requested supply temperature").fill("18");
  await review.click();
  await page
    .getByRole("button", { name: "Confirm target", exact: true })
    .click();
  await expect(review).toBeDisabled();
  const disabled = await contrast();
  expect(disabled.ratio).toBeGreaterThanOrEqual(4.5);
  expect(disabled.opacity).toBe("1");
  await expect(page.locator(".hierarchy-write-state")).toContainText(
    "rejected",
  );
  await expect(page.locator(".ws-setpoint-button")).toContainText("16.0 °C");
});
