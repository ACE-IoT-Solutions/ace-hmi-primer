<script setup lang="ts">
import { computed, ref } from "vue";
import { temperatureState, validateTarget, type Scenario } from "../lib/lab";
const scenario = ref<Scenario>("high");
const colorHeavy = ref(false);
const grayscale = ref(false);
const showContext = ref(true);
const level = ref(2);
const target = ref(16);
const draft = ref("16.0");
const pending = ref<number | null>(null);
const error = ref("");
const feedback = ref("No command sent.");
const actual = computed(() =>
  scenario.value === "normal" ? 16.2 : scenario.value === "high" ? 24.4 : 18.5,
);
const state = computed(() =>
  temperatureState(actual.value, target.value, scenario.value === "stale"),
);
const levels = [
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
    note: "A Level 2 view groups information and controls for routine monitoring and changes. The example below serves that role.",
  },
  {
    name: "Detail",
    scope: "AHU-01 cooling subsystem",
    task: "Why is supply temperature deviating?",
    items: [
      "Cooling valve command · 92%",
      "Chilled-water availability · available",
      "Supply fan · commanded on / proof on",
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
];
const trend = computed(() =>
  scenario.value === "normal"
    ? [16.7, 16.5, 16.4, 16.2, 16.1, 16.2]
    : scenario.value === "high"
      ? [16.4, 17.1, 18.5, 20.2, 22.4, 24.4]
      : [16.4, 16.8, 17.2, 17.7, 18.1, 18.5],
);
const y = (value: number) => 150 - ((value - 12) / 16) * 125;
const points = computed(() =>
  trend.value.map((v, i) => `${60 + i * 82},${y(v)}`).join(" "),
);
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
  <section class="lab-layout">
    <aside class="panel lab-controls">
      <h2>Shape the display</h2>
      <label class="field"
        >Process scenario<select v-model="scenario">
          <option value="normal">Normal temperature</option>
          <option value="high">Rising supply temperature</option>
          <option value="stale">Temperature link lost / stale data</option>
        </select></label
      ><label class="toggle"
        ><input v-model="colorHeavy" type="checkbox" /> Color-heavy normal
        equipment</label
      ><label class="toggle"
        ><input v-model="grayscale" type="checkbox" /> View in grayscale</label
      ><label class="toggle"
        ><input v-model="showContext" type="checkbox" /> Show target, band, and
        trend</label
      >
      <div class="lesson-note">
        <strong>Try this</strong>
        <p>
          With the high-temperature scenario selected, remove context. Can the
          isolated number tell you whether the process is recovering?
        </p>
      </div>
      <p class="source">
        Based on § 5.1.4, 5.2.1.2–5.2.1.5, and 6.3.1. Colors, limits, and AHU
        data are ACE examples.
      </p>
    </aside>
    <div class="hmi-screen" :class="{ colorful: colorHeavy, grayscale }">
      <div class="screen-header">
        <span>WEST BUILDING / AHU-01</span><span>TRAINING DISPLAY</span>
      </div>
      <div
        class="screen-status"
        :class="{ attention: state.attention }"
        role="status"
      >
        <strong>{{ state.attention ? "⚠ " : "" }}{{ state.label }}</strong
        ><span>{{ state.description }}</span>
      </div>
      <div class="process-path" aria-label="Air path">
        <div><span>RETURN AIR</span><strong>23.0 °C</strong></div>
        <div class="process-device coil">
          <span>COOLING COIL</span
          ><strong>Valve {{ scenario === "normal" ? "34" : "92" }}%</strong>
        </div>
        <div class="process-device fan">
          <span>SUPPLY FAN</span><strong>Proof: ON</strong>
        </div>
        <div>
          <span>SUPPLY AIR</span><strong>{{ actual.toFixed(1) }} °C</strong
          ><small v-if="scenario === 'stale'">LAST KNOWN VALUE</small>
        </div>
      </div>
      <div class="measurement">
        <div>
          <span>SUPPLY AIR TEMPERATURE</span
          ><strong>{{ actual.toFixed(1) }} <small>°C</small></strong>
        </div>
        <div v-if="showContext">
          <span>ACCEPTED TARGET</span
          ><strong>{{ target.toFixed(1) }} <small>°C</small></strong>
        </div>
      </div>
      <div v-if="showContext" class="trend-panel">
        <div class="section-top">
          <strong>Supply temperature · °C</strong
          ><span>{{
            scenario === "stale"
              ? "Historical data ending 12 min ago"
              : "Last 30 minutes"
          }}</span>
        </div>
        <svg
          viewBox="0 0 520 195"
          role="img"
          :aria-label="`Supply temperature trend: ${trend.join(', ')} degrees Celsius. Target ${target.toFixed(1)}. ${scenario === 'stale' ? 'Ends 12 minutes ago; no current data.' : 'Over the last 30 minutes.'}`"
        >
          <rect
            x="60"
            :y="y(target + 2)"
            width="410"
            :height="y(target - 2) - y(target + 2)"
            fill="#e1e4e7"
          />
          <g v-for="tick in [12, 16, 20, 24, 28]" :key="tick">
            <line
              x1="60"
              x2="470"
              :y1="y(tick)"
              :y2="y(tick)"
              stroke="#ccd1d6"
            />
            <text x="25" :y="y(tick) + 5">{{ tick }}</text>
          </g>
          <line
            x1="60"
            x2="470"
            :y1="y(target)"
            :y2="y(target)"
            stroke="#3e4854"
            stroke-dasharray="6 4"
          />
          <polyline
            :points="points"
            fill="none"
            stroke="#174c7c"
            stroke-width="3"
          />
          <circle cx="470" :cy="y(actual)" r="5" fill="#174c7c" />
          <text x="60" y="184">
            {{ scenario === "stale" ? "42 min ago" : "30 min ago" }}
          </text>
          <text x="400" y="184">
            {{ scenario === "stale" ? "12 min ago" : "Now" }}
          </text>
        </svg>
        <p>
          Solid: measured temperature · Dashed: accepted target · Shaded:
          illustrative ±2 °C band
        </p>
      </div>
      <p v-else class="context-hidden">
        Context hidden for comparison. The number alone gives no direction of
        change.
      </p>
      <p class="screen-footnote">
        Fixed teaching data ·
        {{
          scenario === "stale"
            ? "Current process state unknown"
            : "Simulated data quality: good"
        }}
        · No connection to real equipment
      </p>
    </div>
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
        separate observation.
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
