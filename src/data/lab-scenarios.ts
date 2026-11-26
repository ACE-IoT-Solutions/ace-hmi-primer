import type { LabSnapshot, Scenario } from "../lib/lab-types";
const baseScenarios: Record<string, Partial<LabSnapshot>> = {
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
const alarm = (
  id: string,
  priority: "high" | "medium" | "low",
  equipment: string,
  message: string,
  kind: "alarm" | "alert" = "alarm",
) => ({
  id,
  priority,
  equipment,
  message,
  kind,
  acknowledged: false,
  active: true,
});
baseScenarios.cascade = {
  ...baseScenarios.high,
  question: "Which condition should the operator investigate first?",
  evidence:
    "A chiller trip is upstream of warm AHU supply air and affected zones. Priorities come from the example alarm philosophy, not simply from which alarm appeared last. Acknowledge records recognition; it does not clear an active condition.",
  artLimit:
    "An animated fan can keep running while a shared utility has failed. A functional propagation path and prioritized alarm information connect symptoms to the upstream condition.",
  alarms: [
    alarm("zone-warm", "low", "Zone 101", "Zone comfort limit exceeded"),
    alarm("filter-due", "low", "AHU-01", "Filter maintenance due", "alert"),
    alarm("ahu-warm", "medium", "AHU-01", "Supply temperature high"),
    alarm("chiller-trip", "high", "Chiller-01", "Chiller trip"),
  ],
};
baseScenarios.override = {
  ...baseScenarios.high,
  valveCommand: 0,
  controlDemand: 92,
  points: {
    supplyTemperature: { quality: "good" },
    coolingValve: {
      quality: "good",
      override: {
        priority: 8,
        source: "Maintenance technician",
        since: "2 hours ago",
        value: 0,
      },
    },
  },
  question:
    "Why is the effective valve command zero while the loop asks for cooling?",
  evidence:
    "An illustrative BACnet priority-8 operator override holds the valve command at 0% while automatic demand is 92%. Review its source, age and maintenance context before release. This example does not implement the complete BACnet priority array.",
  artLimit:
    "A blue coil does not establish an effective cooling command. Both displays receive the override metadata; the task display brings it into the operating context.",
};
baseScenarios.disconnected = {
  ...baseScenarios.stale,
  commState: "disconnected",
  question:
    "Does continued browser animation mean the whole display is connected?",
  evidence:
    "All process values are retained from 12 minutes ago. The display connection is failed, so fan proof and valve command are also unknown as current observations. Diagnostics separate browser rendering from controller communications.",
  artLimit:
    "The browser can animate entirely from retained values. Motion is not a display-health check.",
};
export const labScenarios = Object.fromEntries(
  Object.entries(baseScenarios).map(([id, raw]) => [
    id,
    {
      controlDemand: raw.valveCommand ?? 0,
      alarms: [],
      commState: "connected",
      writeState: { phase: "idle", message: "No write requested." },
      points: {
        supplyTemperature: { quality: raw.stale ? "stale" : "good" },
        coolingValve: { quality: "good" },
      },
      ...raw,
      ...(raw.commState === "disconnected"
        ? {
            points: {
              supplyTemperature: { quality: "unknown" },
              coolingValve: { quality: "unknown" },
            },
          }
        : {}),
    },
  ]),
) as Record<Scenario, LabSnapshot>;
