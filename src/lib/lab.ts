export type Scenario = "normal" | "high" | "stale";
export function temperatureState(
  actual: number,
  target: number,
  stale: boolean,
) {
  if (stale)
    return {
      label: "STALE DATA",
      description: "Current temperature unknown · last update 12 min ago",
      attention: true,
    };
  if (actual > target + 2)
    return {
      label: "SUPPLY TEMPERATURE HIGH",
      description: `${(actual - target).toFixed(1)} °C above target · investigate cooling response`,
      attention: true,
    };
  if (actual < target - 2)
    return {
      label: "SUPPLY TEMPERATURE LOW",
      description: `${(target - actual).toFixed(1)} °C below target · investigate heating / cooling response`,
      attention: true,
    };
  return {
    label: "WITHIN OPERATING BAND",
    description: "Current measurement within ±2.0 °C of target",
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
