export const checklist = [
  {
    title: "Tasks and users",
    text: "Primary users and representative normal, startup, shutdown, and abnormal tasks are documented. Secondary-user needs do not obstruct primary operation.",
    clause: "4.3.3",
  },
  {
    title: "System standards",
    text: "Philosophy, style-guide rules, and toolkit components are identified. Exceptions have a rationale and owner.",
    clause: "4.1–4.2.3",
  },
  {
    title: "Display purpose",
    text: "Every display has a clear scope. Overview, routine operation, detail, and diagnostics are organized around tasks.",
    clause: "6.3",
  },
  {
    title: "Attention and readability",
    text: "Important conditions have redundant cues. Text, contrast, and input targets work at real viewing distances and ambient lighting. Normal motion does not compete with alarms.",
    clause: "5.2; 7.3",
  },
  {
    title: "Information context",
    text: "Values have meaningful labels, units, precision, and context. Relevant trends expose direction. Stale or uncertain data is visibly distinguished in the applied design.",
    clause: "5.1.4; 6.2; 7.2.1.2 + ACE practice",
  },
  {
    title: "Control interactions",
    text: "Entry limits and errors are understandable. Important actions receive appropriate confirmation. Accepted commands and physical feedback are distinguishable.",
    clause: "7.2.1; 7.2.3; 8.3.4",
  },
  {
    title: "Performance",
    text: "Call-up, ongoing refresh, write, and feedback targets are agreed and tested against actual process and task needs.",
    clause: "8.3",
  },
  {
    title: "Testing with users",
    text: "Representative operators perform scripted tasks. Expected evidence, acceptance criteria, deficiencies, and retest results are recorded.",
    clause: "4.4.3; 4.6.3",
  },
  {
    title: "Training and recovery",
    text: "Role-specific training and documentation are current. Backups and restoration procedures have been tested.",
    clause: "4.4.4; 4.5.2; 9.1",
  },
  {
    title: "Change control",
    text: "The change owner, affected displays, approvals, training impacts, and follow-up verification are captured in the facility’s change process.",
    clause: "4.5.1; 4.6.1",
  },
  {
    title: "Alarm presentation",
    text: "Reserved alarm colors, redundant priority cues, acknowledgement and appropriate silencing are defined. Visibility by display level supports response.",
    clause: "5.2.1.2; 5.2.2; 6.3",
  },
  {
    title: "Failure indication",
    text: "Whole-display and individual-point failures are immediately apparent; retained data cannot masquerade as current observations.",
    clause: "5.1(d)",
  },
  {
    title: "Off-system messaging",
    text: "Notification paths are monitored for availability, with backup and escalation appropriate to criticality.",
    clause: "7.2.4",
  },
  {
    title: "Scripting limits",
    text: "Permitted display scripting is documented; communication delays and failures are handled, and control logic runs in a component meeting its availability and maintenance requirements.",
    clause: "4.2.2.1.1",
  },
  {
    title: "Devices and viewing",
    text: "Target devices, viewing distance, aspect ratios, ambient lighting and input/touch geometry have been evaluated with users.",
    clause: "5.2.1.1–5.2.1.3; 7.3",
  },
  {
    title: "Audit and decommission",
    text: "Audits compare the HMI with system standards. Equipment removal updates links, documents, procedures and training, with remaining-system testing assessed.",
    clause: "4.5.3; 4.6.2",
  },
];
