export type {
  Scenario,
  LabSnapshot,
  Alarm,
  Priority,
  Override,
  WriteState,
} from "./lab-types";
export { labScenarios } from "../data/lab-scenarios";
import type { Alarm, Override, WriteState } from "./lab-types";
export function temperatureState(
  actual: number,
  target: number,
  stale: boolean,
  formatDelta: (value: number) => string = (value) => `${value.toFixed(1)} °C`,
) {
  if (stale)
    return {
      label: "Stale data",
      description: "Current temperature unknown · last update 12 min ago",
      attention: true,
    };
  if (actual > target + 2)
    return {
      label: "Supply temperature high",
      description: `${formatDelta(actual - target)} above target · investigate cooling response`,
      attention: true,
    };
  if (actual < target - 2)
    return {
      label: "Supply temperature low",
      description: `${formatDelta(target - actual)} below target · investigate heating / cooling response`,
      attention: true,
    };
  return {
    label: "Within operating band",
    description: `Current measurement within ±${formatDelta(2)} of target`,
    attention: false,
  };
}
export function validateTarget(value: string): string {
  const target = Number(value);
  if (!value.trim() || !Number.isFinite(target))
    return "Enter a numeric target in °C.";
  if (target < 12 || target > 20)
    return "Target must be between 12 and 20 °C. The change has not been sent.";
  if (Math.abs(target * 10 - Math.round(target * 10)) > 1e-8)
    return "Use no more than one decimal place.";
  return "";
}

/** Priority codes are an example site philosophy, not a universal ISA assignment. */
export function orderAlarms(alarms: readonly Alarm[]): Alarm[] {
  const rank = { high: 0, medium: 1, low: 2 };
  return [...alarms].sort(
    (a, b) =>
      Number(a.kind === "alert") - Number(b.kind === "alert") ||
      rank[a.priority] - rank[b.priority],
  );
}
export function alarmsForLevel(
  alarms: readonly Alarm[],
  level: number,
): Alarm[] {
  return orderAlarms(alarms).filter(
    (a) =>
      a.kind === "alarm" &&
      (level >= 3 ||
        a.priority === "high" ||
        (level === 2 && a.priority === "medium")),
  );
}
export const acknowledgeAlarm = (alarms: readonly Alarm[], id: string) =>
  alarms.map((a) =>
    a.id === id && a.kind === "alarm" ? { ...a, acknowledged: true } : a,
  );
export const effectiveCommand = (demand: number, override?: Override) =>
  override ? override.value : demand;
export function requestWrite(requested: number): WriteState {
  return {
    phase: "requested",
    requested,
    message: "Request prepared; controller has not accepted it.",
  };
}
export function advanceWrite(state: WriteState, blocked: boolean): WriteState {
  if (state.phase === "requested")
    return {
      ...state,
      phase: "pending",
      message: "Awaiting the next simulated controller poll.",
    };
  if (state.phase !== "pending") return state;
  return {
    ...state,
    phase: blocked ? "rejected" : "accepted",
    message: blocked
      ? "Rejected: higher-priority override holds the point. Effective value is unchanged."
      : "Controller accepted the request. Measured process response is separate.",
  };
}
