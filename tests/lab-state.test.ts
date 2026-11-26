import assert from "node:assert/strict";
import test from "node:test";
import {
  acknowledgeAlarm,
  advanceWrite,
  alarmsForLevel,
  effectiveCommand,
  orderAlarms,
  requestWrite,
} from "../src/lib/lab";
import { labScenarios } from "../src/data/lab-scenarios";
import { convertTemperature, toCelsius } from "../src/lib/units";
import { glossary } from "../src/data/glossary";
import { checklist } from "../src/data/review-checklist";
test("cascade priorities preserve separate alert semantics and acknowledgement does not clear an active alarm", () => {
  const alarms = labScenarios.cascade.alarms;
  assert.deepEqual(
    orderAlarms(alarms).map((a) => a.id),
    ["chiller-trip", "ahu-warm", "zone-warm", "filter-due"],
  );
  assert.equal(alarmsForLevel(alarms, 1).length, 1);
  assert.equal(alarmsForLevel(alarms, 2).length, 2);
  assert.equal(alarmsForLevel(alarms, 3).length, 3);
  const next = acknowledgeAlarm(alarms, "chiller-trip");
  assert.equal(next.find((a) => a.id === "chiller-trip")!.acknowledged, true);
  assert.equal(next.find((a) => a.id === "chiller-trip")!.active, true);
  assert.equal(
    alarms.find((a) => a.id === "chiller-trip")!.acknowledged,
    false,
  );
});
test("effective output follows the explicit override while automatic demand is retained", () => {
  const snapshot = labScenarios.override;
  assert.equal(snapshot.controlDemand, 92);
  assert.equal(snapshot.valveCommand, 0);
  assert.equal(
    effectiveCommand(
      snapshot.controlDemand,
      snapshot.points.coolingValve.override,
    ),
    0,
  );
  assert.equal(effectiveCommand(snapshot.controlDemand), 92);
  assert.equal(snapshot.points.coolingValve.override!.priority, 8);
});
test("write lifecycle cannot claim acceptance while pending and rejection retains requested intent", () => {
  const requested = requestWrite(18);
  const pending = advanceWrite(requested, false);
  assert.equal(requested.phase, "requested");
  assert.equal(pending.phase, "pending");
  const rejected = advanceWrite(pending, true);
  assert.equal(rejected.phase, "rejected");
  assert.equal(rejected.requested, 18);
  assert.equal(advanceWrite(pending, false).phase, "accepted");
  assert.equal(advanceWrite(rejected, false), rejected);
});
test("whole-display loss marks all modeled point quality unknown, unlike a single stale sensor", () => {
  assert.equal(labScenarios.stale.points.supplyTemperature.quality, "stale");
  assert.equal(labScenarios.stale.points.coolingValve.quality, "good");
  assert.equal(labScenarios.disconnected.commState, "disconnected");
  assert.ok(
    Object.values(labScenarios.disconnected.points).every(
      (point) => point.quality === "unknown",
    ),
  );
});
test("unit changes are reversible and do not alter the underlying process snapshot", () => {
  assert.equal(convertTemperature(0, "F"), 32);
  assert.equal(convertTemperature(-40, "F"), -40);
  assert.equal(convertTemperature(16, "F"), 60.8);
  assert.ok(Math.abs(toCelsius(60.8, "F") - 16) < 1e-9);
  assert.equal(labScenarios.high.actual, 24.4);
});
test("reference fixes and expanded checklist preserve actionable source locators", () => {
  assert.equal(glossary.length, 44);
  assert.equal(glossary.find((item) => item[0] === "HMI")![2], "3.1.21");
  assert.match(glossary.find((item) => item[0] === "Faceplate")![2]!, /3.1.17/);
  assert.equal(checklist.length, 16);
  assert.equal(new Set(checklist.map((item) => item.title)).size, 16);
});
