import assert from "node:assert/strict";
import test from "node:test";
import { labScenarios } from "../src/data/lab-scenarios";
import {
  buildingCondition,
  pointDiagnostic,
} from "../src/lib/building-hierarchy";

test("building summaries expose untrusted observations before diagnosing service", () => {
  assert.match(
    buildingCondition(labScenarios.disconnected, 16),
    /current service unknown/,
  );
  assert.match(
    buildingCondition(labScenarios.stale, 16),
    /current service unknown/,
  );
  assert.match(
    buildingCondition(labScenarios["feedback-lost"], 16),
    /unverified/,
  );
  assert.match(
    buildingCondition(labScenarios["valve-stuck"], 16),
    /position mismatch/,
  );
  assert.match(
    buildingCondition(labScenarios["warm-water"], 16),
    /Entering water/,
  );
  assert.match(
    buildingCondition(labScenarios.normal, 16),
    /Within operating band/,
  );
  assert.match(
    buildingCondition(labScenarios.normal, 12),
    /Supply temperature high/,
  );
});
test("focused diagnostics retain real point identity, independent quality and sample age", () => {
  const snapshot = labScenarios["feedback-lost"];
  const position = pointDiagnostic(snapshot, "valvePosition");
  assert.equal(position.binding, "AHU01.CLV.POS");
  assert.equal(position.value, 5);
  assert.equal(position.current, false);
  assert.equal(position.ageSeconds, 720);
  assert.equal(position.quality, "stale");
  const water = pointDiagnostic(snapshot, "enteringWater");
  assert.equal(water.value, 6);
  assert.equal(water.current, true);
  assert.equal(water.ageSeconds, 5);
  for (const point of [
    "supplyTemperature",
    "valvePosition",
    "enteringWater",
    "leavingWater",
  ] as const)
    assert.equal(
      pointDiagnostic(labScenarios.disconnected, point).current,
      false,
    );
  assert.equal(
    pointDiagnostic({ ...snapshot, valvePosition: null }, "valvePosition")
      .quality,
    "unknown",
  );
});
