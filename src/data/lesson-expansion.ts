import type { Lesson } from "./lessons";
export const lessonAdditions: Record<string, Partial<Lesson>> = {
  lifecycle: {
    cards: [
      {
        title: "Six groups of mandatory obligations",
        clause: "4.1; 4.2.3; 4.5.1; 4.6.1; 5.1; 9.1",
        basis:
          "Mandatory requirements, paraphrased and grouped; not a count of individual shall sentences.",
        items: [
          "Develop and manage the HMI through a lifecycle, with system standards created and used as its foundation (§ 4.1).",
          "Handle toolkit changes through Management of Change (§ 4.2.3).",
          "Handle in-service HMI changes through MOC; clauses 4.5.1 and 4.6.1 describe this obligation.",
          "Support the primary monitoring and control tasks (§ 5.1).",
          "Consider safe and efficient control; early abnormal-condition detection and response; prioritization during major or simultaneous upsets; and immediately apparent display/item failures (§ 5.1(a–d)).",
          "Incorporate HMI training into the end-user organization’s training process and relevant change management (§ 9.1).",
        ],
      },
    ],
  },
  hierarchy: {
    title: "Structure and navigation",
    summary:
      "Choose a display style and navigation design that serve the task.",
    additionalSections: [
      {
        title: "Choose the representation deliberately",
        text: "The Table 6 style families include lists, process views, schematic overviews, functional overviews including dashboards, graphs including trends, groups of faceplates, logic monitors, procedural views, video and infrastructure diagnostics. Select from functional requirements rather than filling a template. A VAV comparison list and a plant dependency view solve different problems (§ 6.1–6.2, Table 6; standard guidance).",
      },
      {
        title: "Design the navigation network",
        text: "Hierarchical navigation follows scope; relational navigation follows connections between systems; sequential navigation follows a procedure. A central plant and its consumers often benefit from relational links. A navigation drawing makes these paths reviewable. Yoking opens related displays together from one selection. Make navigation distinguishable from process commands (§ 7.2.2; standard guidance and ACE examples).",
      },
      {
        title: "Use example targets as examples",
        text: "Table 8 illustrates an alarm summary accessible in one selection, critical displays in one or two, and noncritical displays in three. Establish criteria for the actual task and verify them; these examples are not universally mandatory click limits (§ 7.2.2.3, Table 8; standard guidance).",
      },
    ],
    clauses: "6.1–6.3.4; 7.2.2; Tables 6 and 8",
  },
  context: {
    additionalSections: [
      {
        title: "Present values in the user’s working form",
        text: "Use units the user can work with directly, readable precision, a leading zero for fractional values, and stable numeric placement. Mixed-case task language and familiar words help scanning. Do not force operators to mentally expand a chain of abbreviations. The lab supports °F and °C from the same data (§ 5.1.3(d); 7.2.1.2–7.2.1.3, Table 7; standard guidance).",
      },
      {
        title: "Show the missing time and the scope of failure",
        text: "A stale trend should leave the missing interval visible up to now, rather than stretching the last observation to the current edge. Distinguish one stale sensor from failure of all data on a display. Continuing browser animation provides no evidence of connection health (§ 5.1(d), 5.1.4; required design consideration and ACE application).",
      },
    ],
  },
  interaction: {
    additionalSections: [
      {
        title: "Confirm the affected list and preserve a way back",
        text: "A direct process action should require multiple deliberate inputs. For a multi-item change, confirm the whole affected list and support canceling or recovering to the prior configuration. Provide feedback for entries beyond expected ranges; critical inputs need enforced acceptable bounds. A recorded reason for an unusual entry does not grant authority or bypass hard safety limits (§ 7.2.1.4(b, c, f, g); 7.2.3; standard guidance).",
      },
      {
        title: "Keep faceplates usable",
        text: "Use inset editable fields, visible unavailable controls and verb-based button labels. A popup should preserve important operating information, be movable, and maintain clear keyboard focus. If it times out, provide an appropriate user override. Keep process actions distinct from navigation (§ 7.2.1.1, 7.2.1.5–7.2.1.6; standard guidance).",
      },
      {
        title: "Recognize forced values",
        text: "Training includes forced points and operating modes. In the building example, a priority-8 override holds an output at zero while the loop asks for cooling. Show automatic demand, effective command, source and age. A command can be delayed or rejected; do not make local input echo appear to be controller acceptance (§ 9.1.1(c, k); 8.3.3–8.3.4; ACE applied practice).",
      },
    ],
  },
  performance: {
    additionalSections: [
      {
        title: "Separate HMI timing from human performance",
        text: "Duty factors describe system response; performance-shaping factors affect how quickly people detect, diagnose and act. A useful review measures both. A boiler can be a small process system; geographically distributed BAS sites may resemble SCADA/RTU use. Select requirements for the category and real communications constraints (§ 8.1–8.3; standard guidance and ACE application).",
      },
      {
        title: "Refresh relative to process dynamics",
        text: "Clause 8.3.2 advises a refresh interval no slower than about half the fastest expected response time and describes 1–5 seconds as normally acceptable. Those are recommendations, not one universal mandatory scan rate. Where opening takes longer, showing the graphic before filling values can let users orient sooner, but unpopulated values must remain apparent (§ 8.1, 8.3.2; standard guidance).",
      },
    ],
  },
  validation: {
    additionalSections: [
      {
        title: "Plan verification, audit and recovery",
        text: "Use factory, site and integration testing as appropriate, track deficiencies and retest fixes. Backups should cover embedded programs and controller/control-system configuration needed by the HMI, not only display files. Audits compare management with system standards. Decommissioning includes related documentation and assessment of remaining-system testing and training (§ 4.4.3; 4.5.2–4.5.3; 4.6.2; standard guidance).",
      },
      {
        title: "Choose an implementation that can support the control duty",
        text: "Specify acceptable display scripting in the style guide and handle communication delays and failures. Control or procedural logic should run in a control-system component and method that meet availability and maintenance needs; the standard permits that component to be an HMI or controller. A browser-page-lifetime script is an unsuitable basis for the example freeze-protection duty (§ 4.2.2.1.1; standard guidance and ACE judgment).",
      },
    ],
  },
  purpose: {
    additionalSections: [
      {
        title: "Fit the project’s actual scope",
        text: "The standard is not a complete purchase specification. Applicable local requirements remain relevant. New systems or major migrations can enter at system standards, while new or modified displays enter at design. Improvements feed operating experience back into design and design lessons back into standards (§ 1.2; 4.1; standard scope and lifecycle model).",
      },
    ],
  },
};
export const newLessons: Lesson[] = [
  {
    id: "alarms",
    title: "Alarms and attention",
    summary:
      "Distinguish awareness from response and prioritize simultaneous upsets.",
    sections: [
      {
        title: "Alarm and alert have different jobs",
        text: "An alarm indicates an abnormal condition requiring an operator response. An alert calls for awareness separately from alarm indications and does not meet the alarm criteria. A maintenance reminder should not casually adopt the same presentation as a high-priority process alarm. ISA-101 connects this subject to the facility’s ISA-18.2 alarm philosophy (§ 3.1.1–3.1.2; standard definitions, paraphrased).",
      },
      {
        title: "Reserve attention for what matters",
        text: "Reserve alarm colors for alarm meanings. Provide redundant text or shape, meaningful priority coding and consistent acknowledgment indications. Blinking or flashing should be limited to conditions requiring attention, with a way to stop it; moving or blinking text is difficult to read. Acknowledging an active alarm does not make its process condition normal (§ 5.2.1.2, 5.2.1.5; standard guidance and ACE interpretation).",
      },
      {
        title: "Prioritize the upset, not the prettiest symbol",
        text: "The design must consider helping operators prioritize major or simultaneous upsets. A Level 1 overview should expose important conditions and propagation paths; Level 2 includes top/middle priorities with cues for low-priority conditions, and Level 3 includes alarms of all priorities for the equipment. Visibility by level is guidance; the site determines actual alarm assignments (§ 5.1(c); 6.3.1–6.3.3).",
      },
      {
        title: "Make sound and remote notification useful",
        text: "Audible warnings should reinforce visual indications, suit the ambient conditions and hearing needs, avoid startling users or obstructing communication, and support appropriate silencing after acknowledgment. Priority can be distinguished by a unique visual/audible combination. Off-system paths should be robust and monitored for availability; backup arrangements follow criticality. Sending an SMS is not evidence of an operator response (§ 5.2.2; 7.2.4; standard guidance).",
      },
    ],
    example:
      "A chiller trip produces a high-priority upstream alarm, warm AHU supply air a medium-priority symptom, and a zone comfort limit a low-priority symptom. The filter reminder stays in a separate alert queue. These priorities are illustrative.",
    exercise:
      "Use S1 to inspect each display level and acknowledge the chiller alarm. Then use S5 to detect a failed notification route and provide a backup.",
    takeaway:
      "Acknowledge recognition, preserve the active condition, and expose the evidence needed to prioritize.",
    clauses: "3.1.1–3.1.2; 5.1(c); 5.2.1.2–5.2.2; 6.3; 7.2.4",
    basis:
      "Standard definitions and guidance; clause 5 includes required design considerations. Alarm assignments are ACE examples.",
  },
  {
    id: "workspace",
    title: "Workspace, devices and access",
    summary:
      "Design for the people, work positions and access boundaries that actually exist.",
    sections: [
      {
        title: "Identify users and tasks",
        text: "Clause 4.1.1 gives examples of operations, maintenance, engineering, administrators, management, analysts and other users. Their needs and privileges differ; the list is illustrative, not seven mandatory account roles. Hierarchical task analysis groups tasks, timeline analysis examines their order and timing, and link analysis examines how tasks connect. Workload and adjacency studies help console design (§ 4.1.1; 4.3.1; 4.3.3; standard guidance).",
      },
      {
        title: "Review the workspace as well as the page",
        text: "Viewing distance, ambient illumination, reflections, corrective lenses, age-related vision, hearing and physical input devices affect use. A tablet in a mechanical room and a wall overview require different legibility and interaction decisions. Aspect-ratio changes can distort a display. Use neutral backgrounds and appropriate contrast; black is not a universally appropriate operating background (§ 5.2; 7.3; standard guidance).",
      },
      {
        title: "Make access boundaries understandable",
        text: "Consider permissions by role, authority and location, temporary log-over for specific tasks, and a reason or signature where appropriate. An unavailable control should remain recognizable. These HMI concepts sit within a larger account-management/security program; a disabled browser button alone is not access enforcement (§ 4.2.1; 7.2.1.5; 7.2.3; 7.2.5; standard guidance).",
      },
      {
        title: "Train for the role and sustain evidence",
        text: "Operations, maintenance, engineering/administrators and management have different training needs. Connect training to the organization’s process and changes. Timed tasks can provide usability evidence if the protocol, participants, conditions and errors are recorded. A self-timed run or a color-view approximation is not a substitute for representative-user validation (§ 9.1–9.1.4; 4.4.3; 8.1; requirement and guidance).",
      },
    ],
    example:
      "An operator needs a legible alarm overview at normal working distance; a technician needs point diagnostics on a tablet; a viewer can inspect status without process-command authority.",
    exercise:
      "Use S10 on different device contexts, S7 with read-only and operator roles, and S11 to record detection, diagnosis and response separately.",
    takeaway:
      "Validate the task with the intended people, devices and environment.",
    clauses: "4.1.1; 4.3.1; 4.3.3; 5.2; 7.2.5; 7.3; 9.1",
    basis:
      "Standard guidance and the training-process requirement; device simulations and example access roles are ACE choices.",
  },
];
