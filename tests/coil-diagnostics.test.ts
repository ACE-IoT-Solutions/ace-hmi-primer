import assert from "node:assert/strict";
import test from "node:test";
import { labScenarios } from "../src/data/lab-scenarios";
import {
  valveDiagnostic,
  waterDiagnostic,
  valveTravelAllowance,
  valveTolerance,
} from "../src/lib/coil-diagnostics";

test("independent position and water observations distinguish travel fault from warm supply", () => {
  const stuck = labScenarios["valve-stuck"],
    warm = labScenarios["warm-water"];
  assert.equal(stuck.valveCommand, warm.valveCommand);
  assert.equal(stuck.actual, warm.actual);
  assert.equal(valveDiagnostic(stuck).mismatch, true);
  assert.equal(valveDiagnostic(warm).mismatch, false);
  assert.equal(waterDiagnostic(stuck).warm, false);
  assert.equal(waterDiagnostic(warm).warm, true);
  assert.equal(waterDiagnostic(stuck).delta, 12);
  assert.equal(waterDiagnostic(warm).delta, 1);
});
test("stale, unknown, absent and disconnected position cannot prove a valve mismatch", () => {
  const base = labScenarios["valve-stuck"];
  const cases = [
    labScenarios["feedback-lost"],
    labScenarios.disconnected,
    { ...base, valvePosition: null },
    {
      ...base,
      points: {
        ...base.points,
        valvePosition: { quality: "unknown" as const },
      },
    },
    {
      ...base,
      points: { ...base.points, coolingValve: { quality: "stale" as const } },
    },
  ];
  for (const snapshot of cases) {
    assert.equal(valveDiagnostic(snapshot).mismatch, false);
    assert.match(valveDiagnostic(snapshot).label, /unknown/);
  }
});
test("travel allowance and tolerance prevent acceptance or small differences being treated as travel faults", () => {
  const base = labScenarios["valve-stuck"];
  const pending = valveDiagnostic({
    ...base,
    valveCommandAgeSeconds: valveTravelAllowance - 1,
  });
  assert.equal(pending.mismatch, false);
  assert.match(pending.label, /Travel time not elapsed/);
  assert.equal(
    valveDiagnostic({ ...base, valveCommandAgeSeconds: valveTravelAllowance })
      .mismatch,
    true,
  );
  assert.equal(
    valveDiagnostic({
      ...base,
      valvePosition: base.valveCommand - valveTolerance,
    }).mismatch,
    false,
  );
  assert.equal(
    valveDiagnostic({
      ...base,
      valvePosition: base.valveCommand - valveTolerance - 1,
    }).mismatch,
    true,
  );
  assert.equal(valveDiagnostic(labScenarios.override).mismatch, false);
  assert.equal(labScenarios.override.valvePosition, 0);
});
test("water delta requires a current valid pair while single-point quality stays independent", () => {
  const base = labScenarios["warm-water"];
  const staleLeaving = {
    ...base,
    points: { ...base.points, leavingWater: { quality: "stale" as const } },
  };
  assert.equal(waterDiagnostic(staleLeaving).warm, true);
  assert.equal(waterDiagnostic(staleLeaving).delta, null);
  assert.equal(waterDiagnostic({ ...base, enteringWater: null }).delta, null);
  assert.equal(waterDiagnostic({ ...base, enteringWater: NaN }).warm, false);
  assert.equal(waterDiagnostic(labScenarios.disconnected).delta, null);
  assert.equal(
    labScenarios["feedback-lost"].points.enteringWater.quality,
    "good",
  );
});
