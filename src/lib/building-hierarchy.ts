import type { LabSnapshot } from "./lab";
import { temperatureState } from "./lab";
import { valveDiagnostic, waterDiagnostic } from "./coil-diagnostics";
export type BuildingPoint =
  | "supplyTemperature"
  | "valvePosition"
  | "enteringWater"
  | "leavingWater";
export const hierarchyLevels = [
  {
    name: "Overview",
    scope: "Entire assigned responsibility",
    task: "Where is attention needed?",
    purpose:
      "Summarize important conditions, their location and upstream dependencies. Keep routine control out of this overview.",
  },
  {
    name: "Operation",
    scope: "West building / air delivery",
    task: "Is the building getting the required service?",
    purpose:
      "Monitor the system, its consumers and utilities together. Make routine changes here, with review, confirmation and feedback.",
  },
  {
    name: "Detail",
    scope: "AHU-01 / cooling subsystem",
    task: "Why is supply temperature deviating?",
    purpose:
      "Compare demand, command, independent position and water-side response. Use equipment detail for diagnosis and non-routine work.",
  },
  {
    name: "Diagnostics",
    scope: "Selected point / diagnostic faceplate",
    task: "Can I trust this observation?",
    purpose:
      "Inspect the signal, quality, sample age, binding and relevant procedure. A focused faceplate can serve this level; it need not be another full screen.",
  },
] as const;
export const buildingCases = [
  ["valve-stuck", "Valve command / position mismatch"],
  ["warm-water", "Entering water too warm"],
  ["feedback-lost", "Position feedback stale"],
  ["cascade", "Shared chiller trip"],
  ["normal", "Normal operation"],
  ["high", "Rising supply temperature"],
  ["recovering", "Recovering supply temperature"],
  ["fan-fault", "Fan proof lost"],
  ["stale", "Supply temperature stale"],
  ["disconnected", "Display disconnected"],
  ["override", "Maintenance override"],
] as const;
export function buildingCondition(snapshot: LabSnapshot, target: number) {
  if (snapshot.commState === "disconnected")
    return "Display connection lost · current service unknown";
  if (snapshot.stale)
    return "Supply temperature stale · current service unknown";
  if (snapshot.fanCommand !== snapshot.fanProof)
    return "Fan command / proof mismatch";
  if (valveDiagnostic(snapshot).mismatch)
    return "Valve command / position mismatch";
  if (waterDiagnostic(snapshot).warm)
    return "Entering water above example supply range";
  if (snapshot.points.valvePosition.quality !== "good")
    return "Valve position unverified · feedback stale or unknown";
  return temperatureState(snapshot.actual, target, false).label;
}
export function pointDiagnostic(snapshot: LabSnapshot, point: BuildingPoint) {
  const metadata = {
    supplyTemperature: {
      name: "Supply temperature",
      binding: "AHU01.SAT",
      range: [-10, 60],
      source: "Supply duct temperature sensor",
      value: snapshot.actual,
    },
    valvePosition: {
      name: "Valve position feedback",
      binding: "AHU01.CLV.POS",
      range: [0, 100],
      source: "Independent position feedback; not the command echo",
      value: snapshot.valvePosition,
    },
    enteringWater: {
      name: "Entering water temperature",
      binding: "AHU01.CHW.EWT",
      range: [0, 40],
      source: "Coil water inlet temperature sensor",
      value: snapshot.enteringWater,
    },
    leavingWater: {
      name: "Leaving water temperature",
      binding: "AHU01.CHW.LWT",
      range: [0, 40],
      source: "Coil water outlet temperature sensor",
      value: snapshot.leavingWater,
    },
  }[point];
  const quality =
    snapshot.commState === "disconnected" || metadata.value === null
      ? "unknown"
      : snapshot.points[point].quality;
  return {
    ...metadata,
    quality,
    ageSeconds:
      snapshot.points[point].ageSeconds ??
      (snapshot.stale && point === "supplyTemperature" ? 720 : 5),
    current: quality === "good" && metadata.value !== null,
  };
}
