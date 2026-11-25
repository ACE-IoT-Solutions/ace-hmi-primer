export type Scenario = "normal" | "high" | "recovering" | "fan-fault" | "stale";
export interface LabSnapshot {
  actual: number;
  trend: number[];
  valveCommand: number;
  fanCommand: boolean;
  fanProof: boolean;
  stale: boolean;
  question: string;
  evidence: string;
  artLimit: string;
}
export const labScenarios: Record<Scenario, LabSnapshot> = {
  normal: {
    actual: 16.2,
    trend: [16.7, 16.5, 16.4, 16.2, 16.1, 16.2],
    valveCommand: 34,
    fanCommand: true,
    fanProof: true,
    stale: false,
    question: "Is there an operating problem that needs attention?",
    evidence:
      "Supply temperature is close to the accepted target and stable. Fan command and proof agree. Read the target and trend before deciding whether the condition is acceptable.",
    artLimit:
      "Reflections, depth, and continuous movement do not establish whether the system is meeting its target. A quiet normal display leaves attention available for a developing problem.",
  },
  high: {
    actual: 24.4,
    trend: [16.4, 17.1, 18.5, 20.2, 22.4, 24.4],
    valveCommand: 92,
    fanCommand: true,
    fanProof: true,
    stale: false,
    question: "Is the high supply temperature recovering or getting worse?",
    evidence:
      "The temperature has risen from 16.4 to 24.4 °C over 30 minutes while the current cooling valve command is 92%. Investigate cooling response; neither the command nor the artwork proves valve movement, water flow, or coil capacity.",
    artLimit:
      "The fan rotates and the air stream remains blue as temperature rises. The trend and deviation carry the operating meaning; the illustrated airflow is not a measured quantity.",
  },
  recovering: {
    actual: 24.4,
    trend: [27.6, 27.0, 26.4, 25.8, 25.0, 24.4],
    valveCommand: 92,
    fanCommand: true,
    fanProof: true,
    stale: false,
    question: "What changed from the rising-temperature scenario?",
    evidence:
      "The current temperature, valve command, fan command, and fan proof are identical to the rising-temperature snapshot. The recent history differs: temperature fell from 27.6 to 24.4 °C. It is recovering but remains above the illustrative operating band.",
    artLimit:
      "The equipment drawing and its animation are identical in these two scenarios. Only the history tells you that one condition is recovering while the other is deteriorating.",
  },
  "fan-fault": {
    actual: 24.4,
    trend: [16.4, 17.1, 18.5, 20.2, 22.4, 24.4],
    valveCommand: 92,
    fanCommand: true,
    fanProof: false,
    stale: false,
    question: "Does a spinning fan graphic prove that the fan is running?",
    evidence:
      "Fan command is ON but run proof is OFF. Investigate that mismatch under the site’s procedures. Run proof is a separate observation; even run proof alone would not establish actual delivered airflow.",
    artLimit:
      "This illustrative animation follows the ON command, so it keeps spinning when proof is lost. The proof value is available in both displays; grouping command and proof and explicitly flagging their mismatch makes the relationship clear.",
  },
  stale: {
    actual: 18.5,
    trend: [16.4, 16.8, 17.2, 17.7, 18.1, 18.5],
    valveCommand: 92,
    fanCommand: true,
    fanProof: true,
    stale: true,
    question:
      "Which part of this scene is still an observation of the current process?",
    evidence:
      "The supply-temperature link is lost. The last known value is 18.5 °C from 12 minutes ago; its trend ends there. Current supply temperature is unknown. Other example signals remain available through their separate links.",
    artLimit:
      "The browser can keep animating after a temperature link fails. Continuing motion does not make a retained temperature fresh. The timestamp and explicit quality indication convey what can be trusted.",
  },
};
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
