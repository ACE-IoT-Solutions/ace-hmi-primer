export const displayStyles = [
  [
    "List",
    "Rows of related equipment or values.",
    "VAV summaries and comparison lists.",
  ],
  [
    "Process",
    "Equipment and process connections.",
    "An AHU or chilled-water flow path.",
  ],
  [
    "Schematic overview",
    "A broad view of the operator’s responsibility.",
    "Building or campus operating overview.",
  ],
  [
    "Functional overview (dashboard)",
    "Information arranged by what a system does.",
    "Cooling production and distribution relationships.",
  ],
  [
    "Topology (location)",
    "Logical layout or location of system elements.",
    "A BACnet network map or electrical one-line.",
  ],
  [
    "Graph (including trend)",
    "Chart-based real-time or historical values.",
    "Diagnosing supply-temperature direction.",
  ],
  [
    "Group",
    "Related faceplates arranged around a task.",
    "Compare several AHU controllers.",
  ],
  [
    "Logic monitor",
    "Logical relationships and states.",
    "Fan permissives and interlocks.",
  ],
  [
    "Procedural",
    "Steps and progress in an operating procedure.",
    "A sequenced plant startup.",
  ],
  [
    "Video",
    "Live or recorded visual observations.",
    "A camera used for a defined observation task.",
  ],
  [
    "Health/Diagnostic",
    "Infrastructure state and diagnostics.",
    "BACnet network or display connectivity.",
  ],
] as const;
export const styleTasks = [
  {
    task: "Compare VAV box values across a floor",
    answer: "List",
    reason:
      "A list makes aligned values and exceptions easy to compare. A group view may also be appropriate for active controller work.",
  },
  {
    task: "Review building energy KPIs",
    answer: "Functional overview (dashboard)",
    reason:
      "A task-specific dashboard can aggregate the required measures; it still needs context and trustworthy data.",
  },
  {
    task: "Find failed BACnet network links",
    answer: "Health/Diagnostic",
    reason:
      "A diagnostic view exposes infrastructure availability and affected links.",
  },
  {
    task: "Trace chilled-water plant dependencies",
    answer: "Functional overview (dashboard)",
    reason:
      "Functional relationships connect cooling production, distribution, and consumers. A process view can support piping tasks.",
  },
  {
    task: "Review active alarms in priority order",
    answer: "List",
    reason:
      "A prioritized alarm list supports review. Do not bury the ordering inside decorative equipment art.",
  },
] as const;
