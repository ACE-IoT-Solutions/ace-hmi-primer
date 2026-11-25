export const standardTitle = "ANSI/ISA-101.01-2015";
export const standardUrl =
  "https://www.isa.org/standards-and-publications/isa-standards/isa-101-standards";

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  sections: { title: string; text: string }[];
  example: string;
  exercise: string;
  takeaway: string;
  clauses: string;
  basis: string;
}

export const lessons: Lesson[] = [
  {
    id: "purpose",
    title: "Start with the operator",
    summary:
      "Design around decisions and tasks, across normal and abnormal operation.",
    sections: [
      {
        title: "Begin with a decision",
        text: "An HMI connects people to a process. The useful question is what an operator needs to notice, understand, and do next. A page containing every available point may still fail to support a single operational decision.",
      },
      {
        title: "Find the real tasks",
        text: "Observe primary users, identify their responsibilities, and document routine work, startup, shutdown, and abnormal situations. Include maintenance and engineering needs without making the operator’s essential tasks harder. Review a conceptual layout with users before detailing the graphics.",
      },
      {
        title: "Support situation awareness",
        text: "Clause 5 requires the HMI to support primary monitoring and control tasks and requires consideration of principles including making display failures immediately apparent. A useful display helps the operator perceive the current condition, interpret its meaning, and anticipate what is likely to happen. Put measurements in context with expected ranges, relationships, and trends. A temperature alone tells less than a temperature, its target, and its recent direction.",
      },
    ],
    example:
      "For an AHU that cannot maintain supply temperature, show actual temperature, target, recent history, cooling demand, and equipment status together. A decorative drawing of the coil does not explain whether cooling is working.",
    exercise:
      "Ask a building operator how they diagnose a warm zone. List the decisions, information, and navigation needed before drawing the display.",
    takeaway: "Measure success by how well users perform their tasks.",
    clauses: "4.3.3–4.3.4; 5.1–5.1.4",
    basis:
      "Clause 5 includes mandatory requirements; building example is an ACE application.",
  },
  {
    id: "lifecycle",
    title: "Build a system that can be maintained",
    summary:
      "Connect the philosophy, style guide, and toolkit through the HMI lifecycle.",
    sections: [
      {
        title: "Three foundations",
        text: "The philosophy explains the guiding principles and user needs. The style guide translates those principles into rules and examples for a facility and platform. The toolkit supplies reusable templates, symbols, and faceplates that implement the guide. They serve different purposes even when their documentation is combined.",
      },
      {
        title: "Beyond screen construction",
        text: "Clause 4 requires lifecycle management and system standards. The example lifecycle connects standards, design and review, implementation, and operation. Work includes testing, training, commissioning, maintenance, and eventual decommissioning. Buying a symbol library does not complete that work.",
      },
      {
        title: "Read requirements and recommendations carefully",
        text: "In this edition, clauses 4, 5, and 9 contain mandatory requirements. Clauses 6, 7, and 8 contain recommendations rather than mandatory requirements. Not every sentence in a clause containing requirements is itself a requirement. Keep the distinction when writing acceptance criteria and reviewing a proposed design.",
      },
      {
        title: "Keep improvements controlled",
        text: "Management of Change, audit, and validation span the lifecycle. Changes to the toolkit and in-service HMI are subject to change control. Assess affected displays, procedures, training, backups, and tests. Feed lessons from operation back into designs and standards.",
      },
    ],
    example:
      "Changing the shared fan symbol affects every AHU that uses it. Record the reason, review all states, test affected displays, and update the style guide and training before rollout.",
    exercise:
      "Choose an existing symbol. Identify its governing philosophy principle, style-guide rule, toolkit component, and change owner.",
    takeaway:
      "Consistency is a maintained process, not a one-time visual cleanup.",
    clauses: "4.1–4.2.3; 4.5.1; 4.6",
    basis:
      "Clause 4 includes mandatory requirements; examples are paraphrased and applied.",
  },
  {
    id: "hierarchy",
    title: "Give each display a job",
    summary:
      "Move from an overview to operating context, detail, and diagnostics.",
    sections: [
      {
        title: "Overview and operating displays",
        text: "Level 1 provides the operator’s broad span of responsibility, key conditions, and important abnormalities. It is generally used for awareness rather than routine control. Level 2 is the primary operating view for a process area, supporting monitoring and routine changes with minimal navigation.",
      },
      {
        title: "Detail and diagnostics",
        text: "Level 3 supports equipment detail, diagnostics, non-routine operations, and complex tasks. Level 4 exposes focused diagnostic information, procedures, interlocks, and point details. A Level 4 display can be a popup; it need not fill a monitor. Some detail may be combined with other levels when appropriate.",
      },
      {
        title: "Hierarchy is not a click count",
        text: "The standard recommends a maximum of four display levels. This is guidance about scope and information, not a rule that every interface must have four screens or four clicks. Navigation can have a different number of levels. Make related displays easy to reach and retain orientation.",
      },
    ],
    example:
      "A building operator might use a campus overview (L1), an AHU operating display (L2), an AHU cooling subsystem display (L3), and a sensor diagnostic faceplate (L4). This is an ACE mapping, not a prescribed ISA building hierarchy.",
    exercise:
      "Use the lab’s hierarchy explorer. Decide where a maintenance calibration record belongs and where a routine temperature target change belongs.",
    takeaway:
      "Expose detail when it supports the task while preserving context.",
    clauses: "6.3–6.3.4; 7.2.2",
    basis: "Recommendations; the four-level building mapping is illustrative.",
  },
  {
    id: "visual",
    title: "Make important changes stand out",
    summary: "Use visual emphasis deliberately, with redundant indications.",
    sections: [
      {
        title: "Spend attention carefully",
        text: "Salience is how strongly something attracts attention. If every pipe, motor, and label uses a bright color, developing problems compete with decoration. Use conservative, consistent color and reserve the facility’s alarm colors for their alarm meanings. Important information should stand out most.",
      },
      {
        title: "Communicate without color alone",
        text: "Pair important conditions with text, shape, or another visible distinction. Consider the user population’s vision and hearing, viewing distance, and ambient lighting. A neutral background is recommended; the standard does not prescribe one universal RGB palette. Check grayscale and real working conditions.",
      },
      {
        title: "Remove distracting motion",
        text: "Persistent rotation or flashing can consume attention. Visual dynamics should highlight conditions requiring operator attention, and moving or blinking text makes reading harder. Use the display’s purpose and task analysis to decide information density; no universal percentage of empty space establishes quality.",
      },
    ],
    example:
      "Instead of a bright green fan and blue duct during all normal operation, use quiet normal states and an explicit “SUPPLY TEMPERATURE HIGH” label when needed. An alarm border and text keep the meaning visible in grayscale.",
    exercise:
      "Toggle color-heavy styling and grayscale in the lab. Check whether you can still identify the abnormal condition and explain it.",
    takeaway:
      "A condition should remain understandable when its color disappears.",
    clauses: "4.2.2.1.2; 5.2.1.1–5.2.1.5",
    basis:
      "Recommendations; lab styling is an illustration, not a compliance test.",
  },
  {
    id: "context",
    title: "Turn values into usable information",
    summary: "Show units, expected ranges, trends, and data quality.",
    sections: [
      {
        title: "Put the number in context",
        text: "Use units and a precision appropriate to the measurement and task. Group related information and use familiar terms. An analog indication or trend can make deviation and direction easier to recognize than an isolated changing number.",
      },
      {
        title: "Use trends deliberately",
        text: "A trend needs an identifiable signal, readable scale, and time context. Include a target or meaningful operating band when useful. A single value cannot distinguish recovery from deterioration. Select a time window that shows the dynamics relevant to the decision.",
      },
      {
        title: "Make uncertainty visible",
        text: "In this primer’s building examples, the interface explicitly labels a stale measurement and its last update. The design goal is to prevent a retained value from being mistaken for a fresh observation. A failed link and an abnormal measured process condition call for different diagnoses.",
      },
    ],
    example:
      "A last-received temperature of 18.5 °C is shown as “STALE · last update 12 min ago” after a simulated communications loss. The lab does not infer the current process condition from that old value.",
    exercise:
      "Select the stale-data scenario. Identify what is known, what is unknown, and what an operator should verify before acting.",
    takeaway:
      "A precise-looking value is useful only when its context is trustworthy.",
    clauses: "5.1.4; 6.2; 6.3.1; 7.2.1.2",
    basis:
      "Design recommendations; stale-data treatment is an ACE applied practice.",
  },
  {
    id: "interaction",
    title: "Make control actions clear",
    summary:
      "Separate intent, accepted commands, and measured process response.",
    sections: [
      {
        title: "Help people enter valid values",
        text: "Make editable controls recognizable. Show units, meaningful limits, and useful rejection messages. Apply confirmation to important actions selectively; confirming every action can dilute its value and obstruct work.",
      },
      {
        title: "Close the feedback loop",
        text: "An entered value is not evidence that the controller accepted it. Show useful feedback for the action and distinguish the command from subsequent process response. A fan start command and fan proof are different signals. In the lab, command acceptance is simulated separately from the measurement.",
      },
      {
        title: "Respect roles and scope",
        text: "The HMI philosophy should address the security model. Roles may need different information and permissions. Display navigation and ordinary viewing should not accidentally issue a command. Overall account management and cybersecurity extend beyond the scope of this primer.",
      },
    ],
    example:
      "The lab accepts an illustrative supply-temperature target only within 12–20 °C, asks for explicit confirmation, and then reports simulated controller acceptance. It does not claim that the actual air temperature instantly reached the target.",
    exercise:
      "Try an out-of-range target, cancel a valid change, then confirm it. Identify the difference between the requested target, accepted target, and actual temperature.",
    takeaway:
      "A click is the beginning of an action, not proof of its outcome.",
    clauses: "7.2.1; 7.2.3; 7.2.5; 8.3.3–8.3.4",
    basis:
      "Recommendations; the numeric limits and confirmation flow are ACE examples.",
  },
  {
    id: "performance",
    title: "Design for the process timescale",
    summary: "Understand call-up, refresh, write, and feedback performance.",
    sections: [
      {
        title: "Measure different delays",
        text: "Call-up time runs from requesting a display until its elements have refreshed. Display refresh concerns continuing updates after opening. Write time ends when the controller receives a change. Write refresh concerns when the HMI shows feedback for that action. A fast page load does not prove fast command feedback.",
      },
      {
        title: "Choose targets from user needs",
        text: "Process dynamics, system category, communications, and the task determine suitable performance. Clause 8 includes guidance and examples, not a universal mandatory scan rate. Rapidly jittering numbers can be less useful than appropriately paced updates. Remote systems may have different communication constraints from local machine control.",
      },
      {
        title: "Test under realistic demand",
        text: "Check the displays operators will use during startup, shutdown, and disturbances. Navigation and feedback need to remain useful when many alarms or displays are active. Agree acceptance criteria before testing and record the conditions under which those criteria were demonstrated.",
      },
    ],
    example:
      "An AHU target can arrive at the controller quickly while the supply air takes minutes to respond. Show the accepted target promptly and trend the physical response rather than presenting a delayed process change as a communication failure.",
    exercise:
      "Write separate acceptance criteria for opening an AHU page, seeing a new value, sending a target, and seeing acceptance feedback.",
    takeaway: "Measure the delay that matters to the operator’s decision.",
    clauses: "4.4.3; 8.1–8.3.4",
    basis:
      "Performance guidance; project acceptance criteria must be established separately.",
  },
  {
    id: "validation",
    title: "Prove the design with people",
    summary: "Test realistic tasks, train each role, and sustain the result.",
    sections: [
      {
        title: "Test more than correct rendering",
        text: "Verification checks an activity’s outputs against its objectives and requirements. Validation demonstrates that the installed HMI meets applicable requirements and specifications. Include users performing representative work, not only engineers checking that symbols render. Record deficiencies and retest fixes.",
      },
      {
        title: "Practice the abnormal situations",
        text: "Use representative scenarios such as a fan failing to prove, a rising supply temperature, or lost communications. Ask users to detect the condition, diagnose it, and identify the appropriate response. Capture detection time, navigation problems, and errors as project-specific usability evidence.",
      },
      {
        title: "Train and maintain",
        text: "Clause 9 includes mandatory training requirements. Define the training needed for user roles and sustain it as the HMI changes. Maintenance includes keeping the HMI aligned with the process and maintaining recoverable backups. Test restoration rather than assuming that the presence of files proves recovery.",
      },
    ],
    example:
      "Before deploying a revised AHU graphic, run a scripted high-temperature scenario with operators. Confirm that they can find the problem and necessary evidence, then update training and controlled documentation with the release.",
    exercise:
      "Use the review checklist to write an acceptance task with a starting condition, expected evidence, observer, and pass criterion.",
    takeaway:
      "Operator performance is evidence; visual preference alone is not.",
    clauses: "3.1.44–3.1.45; 4.4.3–4.6; 9.1",
    basis:
      "Clause 9 includes mandatory requirements; usability exercises are ACE examples.",
  },
];
