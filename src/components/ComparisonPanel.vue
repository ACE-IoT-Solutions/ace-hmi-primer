<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { temperatureState, type Scenario, type LabSnapshot } from "../lib/lab";
import AnimatedAhu from "./AnimatedAhu.vue";
import OperatingContext from "./OperatingContext.vue";
import GraphicsReview from "./GraphicsReview.vue";
import { useTemperatureUnits } from "../lib/units";
const units = useTemperatureUnits();
const scenario = defineModel<Scenario>("scenario", { required: true });
const props = defineProps<{ snapshot: LabSnapshot; target: number }>();
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
const snapshot = computed(() => props.snapshot);
const paused = computed(() => !motion.value || reducedMotion.value);
const evidence = computed(() =>
  scenario.value === "normal"
    ? `With the accepted target at ${units.temperature(props.target)} and measured temperature at ${units.temperature(snapshot.value.actual)}: ${temperatureState(snapshot.value.actual, props.target, false, units.delta).description}. The recent history is stable, and fan command and proof agree. A changed target can make the same measurement unacceptable without changing the process snapshot.`
    : snapshot.value.evidence,
);
</script>
<template>
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
          <option value="recovering">
            Recovering · same {{ units.temperature(24.4) }} reading
          </option>
          <option value="fan-fault">Fan commanded on / proof lost</option>
          <option value="cascade">Cascading upset / shared chiller trip</option>
          <option value="override">
            Valve override / effective command held
          </option>
          <option value="disconnected">Whole display disconnected</option>
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
            <dd>{{ units.temperature(snapshot.actual) }}</dd>
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
            <span>West building / AHU-01</span><span>Teaching display</span>
          </div>
          <OperatingContext :snapshot="snapshot" :target="target" />
          <div class="process-path" aria-label="Air path">
            <div>
              <span>Return air</span
              ><strong>{{ units.temperature(23) }}</strong>
            </div>
            <div class="process-device coil">
              <span>Cooling coil</span
              ><strong>Command {{ snapshot.valveCommand }}%</strong>
            </div>
            <div class="process-device fan">
              <span>Supply fan</span
              ><strong>Proof: {{ snapshot.fanProof ? "ON" : "OFF" }}</strong>
            </div>
            <div>
              <span>Supply air</span
              ><strong>{{ units.temperature(snapshot.actual) }}</strong
              ><small v-if="snapshot.stale">Last known value</small>
            </div>
          </div>
          <p class="screen-footnote">
            Fixed teaching data ·
            {{
              snapshot.commState === "disconnected"
                ? "Whole display disconnected; every process value is retained"
                : snapshot.stale
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
      § 5.1.4; 5.2.1.2; 5.2.1.4–5.2.1.5; 6.3.1; 7.2.1.2. Scenarios, example
      thresholds, and the command-driven animation are ACE teaching choices.
    </p>
  </section>
  <GraphicsReview />
</template>
