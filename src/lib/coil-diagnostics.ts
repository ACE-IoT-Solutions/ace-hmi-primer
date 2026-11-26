import type { LabSnapshot } from "./lab";

// Illustrative site settings, not ISA requirements or actuator specifications.
export const valveTolerance = 10; // percentage points
export const valveTravelAllowance = 120; // seconds
export const enteringWaterRange = [6, 8] as const; // °C
export function currentCoilPoint(
  snapshot: LabSnapshot,
  point: "valvePosition" | "enteringWater" | "leavingWater",
): boolean {
  return (
    snapshot.commState === "connected" &&
    snapshot.points[point].quality === "good" &&
    typeof snapshot[point] === "number" &&
    Number.isFinite(snapshot[point])
  );
}
export function valveDiagnostic(snapshot: LabSnapshot) {
  if (
    !currentCoilPoint(snapshot, "valvePosition") ||
    snapshot.points.coolingValve.quality !== "good"
  )
    return {
      mismatch: false,
      label: "Current valve tracking unknown",
      detail: "Verify command and position quality before comparing them.",
    };
  if (snapshot.valveCommandAgeSeconds < valveTravelAllowance)
    return {
      mismatch: false,
      label: "Travel time not elapsed",
      detail:
        "Acceptance is not movement; wait for fresh position feedback after the travel allowance.",
    };
  const mismatch =
    Math.abs(snapshot.valveCommand - snapshot.valvePosition!) > valveTolerance;
  return {
    mismatch,
    label: mismatch
      ? "Valve command / position mismatch"
      : "Valve position tracks command",
    detail: mismatch
      ? "Investigate actuator, linkage, valve travel and feedback; verify the physical fault."
      : "Position agreement does not establish water flow or cooling response.",
  };
}
export function waterDiagnostic(snapshot: LabSnapshot) {
  const enteringCurrent = currentCoilPoint(snapshot, "enteringWater");
  const leavingCurrent = currentCoilPoint(snapshot, "leavingWater");
  return {
    warm: enteringCurrent && snapshot.enteringWater! > enteringWaterRange[1],
    delta:
      enteringCurrent && leavingCurrent
        ? snapshot.leavingWater! - snapshot.enteringWater!
        : null,
  };
}
