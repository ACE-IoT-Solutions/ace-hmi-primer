<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  labScenarios,
  temperatureState,
  validateTarget,
  type Scenario,
} from "../lib/lab";
import AnimatedAhu from "./AnimatedAhu.vue";
import OperatingContext from "./OperatingContext.vue";
const scenario = ref<Scenario>("high");
const grayscale = ref(false);
const showContext = ref(false);
const motion = ref(true);
const reducedMotion = ref(false);
let motionPreference: MediaQueryList | undefined;
function syncMotionPreference() {
  reducedMotion.value = motionPreference?.matches ?? false;
}
onMounted(() => {
  motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  syncMotionPreference();
  motionPreference.addEventListener("change", syncMotionPreference);
});
onUnmounted(() =>
  motionPreference?.removeEventListener("change", syncMotionPreference),
);
const level = ref(2);
const target = ref(16);
const draft = ref("16.0");
const pending = ref<number | null>(null);
const error = ref("");
const feedback = ref("No command sent.");
const snapshot = computed(() => labScenarios[scenario.value]);
const paused = computed(() => !motion.value || reducedMotion.value);
const evidence = computed(() =>
  scenario.value === "normal"
    ? `With the accepted target at ${target.value.toFixed(1)} °C and measured temperature at ${snapshot.value.actual.toFixed(1)} °C: ${temperatureState(snapshot.value.actual, target.value, false).description}. The recent history is stable, and fan command and proof agree. A changed target can make the same measurement unacceptable without changing the process snapshot.`
    : snapshot.value.evidence,
);
const levels = computed(() => [
  {
    name: "Overview",
    scope: "Operator span of responsibility",
    task: "Where is attention needed?",
    items: [
      "West building · AHU-01 supply temperature",
      "East building · no reported abnormalities",
      "Central plant · chilled-water availability",
    ],
    note: "The overview prioritizes conditions across the building operator’s assigned area. Routine target changes belong in the operating view.",
  },
  {
    name: "Operation",
    scope: "AHU-01 process operating display",
    task: "Is this system delivering the required air?",
    items: [
      "Supply temperature and target",
      "Cooling demand and fan proof",
      "Routine target entry and feedback",
    ],
    note: "A Level 2 view groups information and controls for routine monitoring and changes. The task-focused example serves that role.",
  },
  {
    name: "Detail",
    scope: "AHU-01 cooling subsystem",
    task: "Why is supply temperature deviating?",
    items: [
      `Cooling valve command · ${snapshot.value.valveCommand}%`,
      "Chilled-water availability · available",
      `Supply fan · command ${snapshot.value.fanCommand ? "ON" : "OFF"} / proof ${snapshot.value.fanProof ? "ON" : "OFF"}`,
    ],
    note: "Subsystem detail supports diagnosis. A valve command does not prove valve movement, flow, or cooling capacity. These values are fixed teaching examples.",
  },
  {
    name: "Diagnostics",
    scope: "Supply-air sensor point detail",
    task: "Can I trust this observation?",
    items: [
      "Point · AHU01.SAT · °C",
      "Illustrative range · −10 to 60 °C",
      "Communication quality and last update",
    ],
    note: "Focused diagnostics can live in a faceplate or popup. Show data-quality and device evidence here; avoid making this the only place an operator can notice lost data.",
  },
]);
function request() {
  error.value = validateTarget(draft.value);
  pending.value = error.value ? null : Number(draft.value);
  feedback.value = error.value
    ? "Entry rejected. No command sent."
    : "Change prepared. Waiting for your confirmation.";
}
function confirm() {
  if (pending.value === null) return;
  target.value = pending.value;
  pending.value = null;
  feedback.value = `Simulated controller accepted ${target.value.toFixed(1)} °C. The measured temperature has not been changed.`;
}
function cancel() {
  pending.value = null;
  feedback.value = "Change canceled. No command sent.";
}
</script>

<template>
  <section class="page-heading">
    <span class="eyebrow">EXPLORE / DESIGN LAB</span>
    <h1>See what the operator sees.</h1>
    <p>
      Change the presentation, keep the process condition, and see which
      decisions become easier. All equipment and values are simulated.
    </p>
  </section>
  <section class="comparison-intro">
    <span class="eyebrow">EQUIPMENT ART / OPERATING INFORMATION</span>
    <h2>What did the “advanced graphics” add?</h2>
    <p>
      A familiar specification asks for
      <strong
        >full-color 3D equipment, rotating fans, and animated airflow</strong
      >. This original teaching example supplies those features. Compare it with
      a display organized around the operator’s question. Both read the same
      snapshot.
    </p>
    <p class="muted">
      These are illustrative designs, not screenshots of a vendor product. Judge
      the information and task support rather than the rendering style.
    </p>
  </section>
  <section class="lab-workbench" aria-label="AHU display comparison">
    <div class="panel comparison-controls">
      <label class="field"
        >Process scenario<select v-model="scenario">
          <option value="normal">Normal temperature</option>
          <option value="high">Rising supply temperature</option>
          <option value="recovering">Recovering · same 24.4 °C reading</option>
          <option value="fan-fault">Fan commanded on / proof lost</option>
          <option value="stale">Temperature link lost / stale data</option>
        </select></label
      >
      <label class="toggle"
        ><input v-model="showContext" type="checkbox" /> Add operating context
        to the 3D mimic</label
      >
      <label class="toggle"
        ><input v-model="grayscale" type="checkbox" /> View in grayscale</label
      >
      <div class="motion-controls">
        <button
          :disabled="reducedMotion"
          :aria-pressed="!paused"
          @click="motion = !motion"
        >
          {{
            paused ? "Play decorative animation" : "Pause decorative animation"
          }}
        </button>
        <p role="status">
          {{
            reducedMotion
              ? "Motion is paused by your reduced-motion preference."
              : paused
                ? "Animation paused. Process data and history are unchanged."
                : "Motion follows the fan command, not a measured air stream."
          }}
        </p>
      </div>
    </div>
    <div
      class="comparison-screens"
      :class="{ 'comparison-grayscale': grayscale }"
    >
      <article class="comparison-card mimic-card" aria-labelledby="mimic-title">
        <div class="comparison-title">
          <span class="eyebrow">EQUIPMENT MIMIC</span>
          <h3 id="mimic-title">Depth, shine, and movement.</h3>
          <p>Realistic equipment form with scattered point values.</p>
        </div>
        <AnimatedAhu :snapshot="snapshot" :paused="paused" />
        <dl class="mimic-readings">
          <div>
            <dt>Supply temperature{{ snapshot.stale ? " · retained" : "" }}</dt>
            <dd>{{ snapshot.actual.toFixed(1) }} °C</dd>
          </div>
          <div>
            <dt>Cooling valve command</dt>
            <dd>{{ snapshot.valveCommand }}%</dd>
          </div>
          <div>
            <dt>Supply fan command</dt>
            <dd>{{ snapshot.fanCommand ? "ON" : "OFF" }}</dd>
          </div>
          <div>
            <dt>Supply fan run proof</dt>
            <dd>{{ snapshot.fanProof ? "ON" : "OFF" }}</dd>
          </div>
        </dl>
        <div v-if="showContext" class="hmi-screen added-context">
          <p class="context-added-label">
            Same operating information added to the mimic
          </p>
          <OperatingContext :snapshot="snapshot" :target="target" mimic />
        </div>
        <div v-else class="mimic-context-absent">
          <strong>What is missing?</strong>
          <p>
            No target comparison or time history is presented here. The point
            values are real within this simulation; the moving air and metal
            surfaces add no measurements.
          </p>
        </div>
      </article>
      <article
        class="comparison-card operating-card"
        aria-labelledby="operating-title"
      >
        <div class="comparison-title">
          <span class="eyebrow">TASK-FOCUSED DISPLAY</span>
          <h3 id="operating-title">Condition, context, and evidence.</h3>
          <p>The same points, grouped for monitoring and diagnosis.</p>
        </div>
        <div class="hmi-screen">
          <div class="screen-header">
            <span>WEST BUILDING / AHU-01</span><span>TRAINING DISPLAY</span>
          </div>
          <OperatingContext :snapshot="snapshot" :target="target" />
          <div class="process-path" aria-label="Air path">
            <div><span>RETURN AIR</span><strong>23.0 °C</strong></div>
            <div class="process-device coil">
              <span>COOLING COIL</span
              ><strong>Command {{ snapshot.valveCommand }}%</strong>
            </div>
            <div class="process-device fan">
              <span>SUPPLY FAN</span
              ><strong>Proof: {{ snapshot.fanProof ? "ON" : "OFF" }}</strong>
            </div>
            <div>
              <span>SUPPLY AIR</span
              ><strong>{{ snapshot.actual.toFixed(1) }} °C</strong
              ><small v-if="snapshot.stale">LAST KNOWN VALUE</small>
            </div>
          </div>
          <p class="screen-footnote">
            Fixed teaching data ·
            {{
              snapshot.stale
                ? "Current temperature unknown; other example signals remain available"
                : "Simulated data quality: good"
            }}
            · No connection to real equipment
          </p>
        </div>
      </article>
    </div>
    <div class="comparison-observation">
      <strong>{{
        showContext
          ? "The context improved the mimic. The 3D rendering did not create that context."
          : "Pause the motion. The temperature, proof, quality, and trend do not change."
      }}</strong>
      <p>
        With context enabled, both displays use the same status, measurements,
        and trend component. This separates the benefit of useful information
        from the choice to render equipment in 3D.
      </p>
    </div>
  </section>
  <section class="panel scenario-review" aria-labelledby="scenario-question">
    <span class="eyebrow">READ THE PROCESS</span>
    <h2 id="scenario-question">{{ snapshot.question }}</h2>
    <p>
      Look at the mimic first, then the operating display. Identify the evidence
      you would use before taking action.
    </p>
    <details :key="scenario">
      <summary>Reveal the operating evidence</summary>
      <div class="evidence-grid">
        <div>
          <h3>What the signals tell you</h3>
          <p>{{ evidence }}</p>
        </div>
        <div>
          <h3>What the artwork cannot establish</h3>
          <p>{{ snapshot.artLimit }}</p>
        </div>
      </div>
    </details>
    <p class="source">
      § 5.1.4; 5.2.1.4–5.2.1.5; 6.3.1; 7.2.1.2. Scenarios, example thresholds,
      and the command-driven animation are ACE teaching choices.
    </p>
  </section>
  <section
    class="panel graphics-review"
    aria-labelledby="graphics-review-title"
  >
    <span class="eyebrow">LOOK PAST THE FEATURE LIST</span>
    <h2 id="graphics-review-title">
      A rendering feature is not an operating requirement.
    </h2>
    <div class="comparison-table-wrap">
      <table class="comparison-table">
        <caption>
          What to ask when reviewing an “advanced graphics” specification
        </caption>
        <thead>
          <tr>
            <th scope="col">Specified feature</th>
            <th scope="col">What it establishes here</th>
            <th scope="col">Information the operator actually needs</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Reflective 3D equipment</th>
            <td>Equipment form and spatial appearance.</td>
            <td>
              Identity, operating state, and relationships needed for the task.
            </td>
          </tr>
          <tr>
            <th scope="row">Continuously rotating fan</th>
            <td>The command is ON; rotation follows that same bit.</td>
            <td>
              Command and separate run proof, with their mismatch made apparent.
            </td>
          </tr>
          <tr>
            <th scope="row">Moving blue air stream</th>
            <td>An illustration; no airflow sensor is modeled.</td>
            <td>
              Measured airflow and its required value, if those points exist. Do
              not invent them from an animation.
            </td>
          </tr>
          <tr>
            <th scope="row">Colored cooling coil</th>
            <td>A cooling-related component and its valve command.</td>
            <td>
              Actual temperature response, target, history, and available
              diagnostic measurements.
            </td>
          </tr>
          <tr>
            <th scope="row">Many “live” numeric values</th>
            <td>A snapshot, or retained values if quality is stale.</td>
            <td>
              Units, deviation, direction of change, and an explicit indication
              of data quality.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="lesson-note">
      <h3>Use 3D where the task calls for it.</h3>
      <p>
        Spatial orientation, locating equipment, and maintenance training can
        benefit from an equipment model. That is a different task from deciding
        whether supply temperature is deteriorating. Demonstrate the benefit on
        the actual operator task; decorative depth and motion alone provide no
        additional process evidence in this example.
      </p>
    </div>
  </section>
  <section class="panel specification-example">
    <span class="eyebrow">WRITE A BETTER SPECIFICATION</span>
    <h2>Buy task support you can verify.</h2>
    <div class="evidence-grid">
      <div>
        <h3>Appearance-only wording</h3>
        <blockquote>
          Provide realistic 3D AHU graphics with animated fans, colored coils,
          and moving air streams.
        </blockquote>
        <p>
          Acceptance checks whether the art and motion are present. It does not
          establish whether an operator can diagnose a warm-air complaint.
        </p>
      </div>
      <div>
        <h3>Task-based wording</h3>
        <blockquote>
          For the AHU warm-air diagnostic task, show supply temperature,
          accepted target, engineering units, recent history, and data quality.
          Distinguish fan command from run proof and make their mismatch
          apparent. With operators, verify detection and interpretation of
          rising temperature, recovery, lost proof, and stale data.
        </blockquote>
        <p>
          Define the history window, performance criteria, and test conditions
          for your facility. Artwork can be added, but it does not replace this
          evidence.
        </p>
      </div>
    </div>
    <p class="source">
      Original example specification language, not a quotation or a universal
      ISA requirement.
    </p>
  </section>
  <section class="panel hierarchy">
    <div class="section-top">
      <div>
        <span class="eyebrow">DISPLAY HIERARCHY</span>
        <h2>A different scope at each level.</h2>
      </div>
      <span class="tag">§ 6.3</span>
    </div>
    <div class="level-buttons" role="group" aria-label="Explore display levels">
      <button
        v-for="(item, i) in levels"
        :key="item.name"
        :aria-pressed="level === i + 1"
        @click="level = i + 1"
      >
        <small>LEVEL {{ i + 1 }}</small
        >{{ item.name }}
      </button>
    </div>
    <div class="hierarchy-detail">
      <div>
        <span class="eyebrow">{{ levels[level - 1]!.scope }}</span>
        <h3>{{ levels[level - 1]!.task }}</h3>
        <p>{{ levels[level - 1]!.note }}</p>
      </div>
      <ul>
        <li v-for="item in levels[level - 1]!.items" :key="item">{{ item }}</li>
      </ul>
    </div>
    <p class="source">
      This is an illustrative building mapping. The recommended maximum of four
      display levels is not a prescribed number of screens or navigation clicks.
    </p>
  </section>
  <section class="panel command-demo">
    <div>
      <span class="eyebrow">INTERACTION / § 7.2.1, 7.2.3, 8.3.4</span>
      <h2>Intent. Acceptance. Response.</h2>
      <p>
        Try an invalid entry, cancel a valid change, then confirm it. The
        accepted target updates above; the fixed measured temperature remains a
        separate observation in both displays.
      </p>
      <p class="muted">
        The 12–20 °C limit and instantaneous acceptance are teaching choices,
        not ISA requirements.
      </p>
    </div>
    <div>
      <form @submit.prevent="request">
        <label class="field"
          >Requested supply temperature · °C<input
            v-model="draft"
            type="text"
            inputmode="decimal"
            :aria-invalid="!!error"
            aria-describedby="target-feedback"
        /></label>
        <p v-if="error" class="error-text">{{ error }}</p>
        <button class="primary" type="submit">Review change</button>
      </form>
      <div v-if="pending !== null" class="notice">
        <p>
          Send target {{ pending.toFixed(1) }} °C? Current accepted target:
          {{ target.toFixed(1) }} °C.
        </p>
        <div class="actions">
          <button class="primary" @click="confirm">
            Confirm simulated change</button
          ><button @click="cancel">Cancel</button>
        </div>
      </div>
      <p id="target-feedback" role="status">{{ feedback }}</p>
    </div>
  </section>
</template>
