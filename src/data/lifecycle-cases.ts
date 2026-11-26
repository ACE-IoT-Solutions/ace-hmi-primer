export const lifecycleCases = [
  {
    id: "toolkit",
    title: "Change a shared fan symbol",
    prompt:
      "A toolkit edit changes the meaning of its running-state color on 30 AHU displays.",
    required: ["moc", "test", "training"],
    choices: [
      ["moc", "Record and review the MOC impact across dependent displays"],
      ["test", "Verify all relevant states and affected displays"],
      ["training", "Update the style guide and affected training"],
      ["copy", "Replace the library without tracking dependent displays"],
    ],
    result:
      "A shared symbol change can affect every dependent display. Change control, verification and controlled guidance keep the interpretation consistent.",
    clause: "4.2.3; 4.6.1",
  },
  {
    id: "decommission",
    title: "Decommission AHU-03",
    prompt:
      "AHU-03 is removed, but its overview link, alarm destinations and training page remain.",
    required: ["links", "records", "review"],
    choices: [
      ["links", "Update navigation and affected displays"],
      [
        "records",
        "Update documentation and training and retain appropriate archives",
      ],
      ["review", "Assess remaining-system tests and operating procedures"],
      ["delete", "Delete the graphic only"],
    ],
    result:
      "Removing equipment also changes the remaining HMI. Review links, records, procedures, training and any needed testing rather than treating deletion as the whole activity.",
    clause: "4.5.3",
  },
  {
    id: "audit",
    title: "Audit an operating display",
    prompt:
      "A locally modified page uses alarm colors for decorative pipework and has no approved exception.",
    required: ["compare", "deficiency", "followup"],
    choices: [
      ["compare", "Compare it with the philosophy, style guide and toolkit"],
      ["deficiency", "Record the deviation and a change request"],
      ["followup", "Track correction and verification evidence"],
      ["preference", "Accept the change because its author prefers it"],
    ],
    result:
      "Audit checks management against system standards. Evidence and corrective work matter more than personal visual preference.",
    clause: "4.6.2",
  },
  {
    id: "script",
    title: "Put a control sequence in a graphic",
    prompt:
      "A browser script would own a freeze-protection sequence and stop running when its display closes.",
    required: ["reliability", "failure", "maintenance"],
    choices: [
      [
        "reliability",
        "Assess required availability and the component that can provide it",
      ],
      ["failure", "Handle communication delays and failure modes"],
      [
        "maintenance",
        "Define supported maintenance and change-control methods",
      ],
      ["browser", "Assume that drawing the page proves reliable control"],
    ],
    result:
      "The standard does not impose a blanket ban on HMI logic. It calls for a component and implementation that meet availability and maintenance requirements. A display-lifetime script is a poor fit for this critical sequence; use an appropriate control-system implementation.",
    clause: "4.2.2.1.1",
  },
] as const;
