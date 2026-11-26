import type { LabSnapshot, Scenario } from "../lib/lab-types";
type ScenarioInput = Omit<Partial<LabSnapshot>, "points"> & {
  points?: Partial<LabSnapshot["points"]>;
};
const baseScenarios: Record<string, ScenarioInput> = {
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
  enteringWater: 18,
  leavingWater: 19,
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
  leavingWater: 23,
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
baseScenarios["valve-stuck"] = {
  ...baseScenarios.high,
  valvePosition: 5,
  enteringWater: 6,
  leavingWater: 18,
  question:
    "Is the cooling valve following its command, or is the chilled-water supply too warm?",
  evidence:
    "The effective command is 92%, but independent position feedback remains at 5% after 180 seconds. Entering water is 6.0 °C and leaving water is 18.0 °C. Investigate the actuator, linkage, valve travel and feedback signal first; the mismatch localizes a travel/feedback problem despite cold water at the inlet. Verify physically before declaring a mechanically stuck valve. Water temperatures alone do not prove flow or distinguish every failure.",
  artLimit:
    "A valve symbol colored for its 92% command conceals the 5% feedback. The command-position comparison, elapsed travel time and water-side observations supply diagnostic evidence that the rendering cannot establish.",
};
baseScenarios["warm-water"] = {
  ...baseScenarios.high,
  valvePosition: 92,
  enteringWater: 18,
  leavingWater: 19,
  question:
    "Does this evidence point first to valve travel or chilled-water availability?",
  evidence:
    "Command and independent position feedback both read 92% after 180 seconds, but entering water is 18.0 °C against the illustrative 6–8 °C supply range. Leaving water is 19.0 °C. Investigate upstream chilled-water availability and sensor validity before blaming valve travel. Matching position does not prove flow; inspect flow, isolation, differential pressure and coil condition as needed.",
  artLimit:
    "The same blue coil and high command occur in the valve-travel fault. Independent position feedback and entering water temperature separate these two example fault paths.",
};
baseScenarios["feedback-lost"] = {
  ...baseScenarios.high,
  valvePosition: 5,
  points: { valvePosition: { quality: "stale", ageSeconds: 720 } },
  question:
    "Can a retained valve position establish a current command-position mismatch?",
  evidence:
    "The 5% position is retained from 12 minutes ago. It cannot prove the present valve position or establish a current mismatch with the 92% command. Water temperature sensors remain available independently. Restore or verify position feedback before diagnosing a travel fault; water temperatures alone cannot substitute for position or flow proof.",
  artLimit:
    "A retained position can look as precise as a fresh one. Quality and sample age determine whether the comparison is valid.",
};
export const labScenarios = Object.fromEntries(
  Object.entries(baseScenarios).map(([id, raw]) => {
    const points: LabSnapshot["points"] = {
      supplyTemperature: { quality: raw.stale ? "stale" : "good" },
      coolingValve: { quality: "good" },
      valvePosition: { quality: "good", ageSeconds: 5 },
      enteringWater: { quality: "good", ageSeconds: 5 },
      leavingWater: { quality: "good", ageSeconds: 5 },
      ...raw.points,
    };
    if (raw.commState === "disconnected")
      for (const key of Object.keys(points) as (keyof typeof points)[])
        points[key] = { ...points[key], quality: "unknown", ageSeconds: 720 };
    return [
      id,
      {
        controlDemand: raw.valveCommand ?? 0,
        valvePosition: raw.valveCommand ?? 0,
        valveCommandAgeSeconds: 180,
        enteringWater: 6,
        leavingWater: 12,
        alarms: [],
        commState: "connected",
        writeState: { phase: "idle", message: "No write requested." },
        ...raw,
        points,
      },
    ];
  }),
) as Record<Scenario, LabSnapshot>;
