<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { labScenarios } from "../data/lab-scenarios";
import AnimatedAhu from "./AnimatedAhu.vue";
import OperatingContext from "./OperatingContext.vue";
type Run = {
  at: string;
  display: string;
  scenario: string;
  detectedMs: number;
  diagnosedMs: number;
  responseMs: number;
  diagnosis: string;
  response: string;
  correct: boolean;
};
const key = "ace-hmi-usability-runs-v1";
const display = ref("mimic"),
  scenario = ref<"high" | "fan-fault" | "stale">("high"),
  running = ref(false),
  elapsed = ref(0),
  detected = ref<number | null>(null),
  diagnosed = ref<number | null>(null),
  diagnosis = ref(""),
  response = ref(""),
  warning = ref("");
const records = ref<Run[]>([]);
try {
  const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
  if (Array.isArray(saved))
    records.value = saved
      .filter(
        (r) =>
          r &&
          typeof r.at === "string" &&
          ["mimic", "task"].includes(r.display) &&
          ["high", "fan-fault", "stale"].includes(r.scenario) &&
          ["detectedMs", "diagnosedMs", "responseMs"].every(
            (k) => Number.isFinite(r[k]) && r[k] >= 0,
          ) &&
          typeof r.diagnosis === "string" &&
          typeof r.response === "string" &&
          typeof r.correct === "boolean",
      )
      .slice(-20);
} catch {
  warning.value = "Saved runs could not be read. This visit still works.";
}
const snapshot = computed(() => labScenarios[scenario.value]);
let started = 0,
  interval: ReturnType<typeof setInterval> | undefined;
function start() {
  started = performance.now();
  elapsed.value = 0;
  detected.value = null;
  diagnosed.value = null;
  diagnosis.value = "";
  response.value = "";
  running.value = true;
  interval = setInterval(() => {
    elapsed.value = performance.now() - started;
  }, 100);
}
function detect() {
  detected.value = performance.now() - started;
}
function diagnose() {
  if (detected.value === null || !diagnosis.value) return;
  diagnosed.value = performance.now() - started;
}
function finish() {
  if (
    detected.value === null ||
    diagnosed.value === null ||
    !response.value.trim()
  )
    return;
  clearInterval(interval);
  running.value = false;
  const expected = { high: "rising", "fan-fault": "proof", stale: "stale" };
  records.value = [
    ...records.value,
    {
      at: new Date().toISOString(),
      display: display.value,
      scenario: scenario.value,
      detectedMs: detected.value,
      diagnosedMs: diagnosed.value,
      responseMs: performance.now() - started,
      diagnosis: diagnosis.value,
      response: response.value.trim(),
      correct: diagnosis.value === expected[scenario.value],
    },
  ].slice(-20);
  save();
}
function save() {
  try {
    localStorage.setItem(key, JSON.stringify(records.value));
  } catch {
    warning.value = "Runs are available in this visit but could not be saved.";
  }
}
function clear() {
  records.value = [];
  save();
}
onUnmounted(() => clearInterval(interval));
</script>
<template>
  <section class="panel exercise-panel">
    <span class="eyebrow">S11 · Timed detection run</span>
    <h2>Collect evidence about a task.</h2>
    <p>
      This is a self-paced practice run, not a controlled study. Record
      detection, diagnosis and a written response from the start of a run.
      Familiarity, ordering, device size and deliberately different information
      content affect the result. Do not interpret these times as proof that one
      rendering style universally performs better.
    </p>
    <div class="clinic-controls">
      <label class="field"
        >Test display<select v-model="display" :disabled="running">
          <option value="mimic">Animated equipment mimic</option>
          <option value="task">Task-focused operating display</option>
        </select></label
      ><label class="field"
        >Test condition<select v-model="scenario" :disabled="running">
          <option value="high">Rising temperature</option>
          <option value="fan-fault">Lost fan proof</option>
          <option value="stale">Stale temperature</option>
        </select></label
      >
    </div>
    <button v-if="!running" class="primary" @click="start">
      Start timed run
    </button>
    <template v-if="running"
      ><p aria-live="off">Elapsed: {{ (elapsed / 1000).toFixed(1) }} s</p>
      <div class="hmi-screen">
        <AnimatedAhu
          v-if="display === 'mimic'"
          :snapshot="snapshot"
          :paused="false"
        /><OperatingContext v-else :snapshot="snapshot" :target="16" />
      </div>
      <button :disabled="detected !== null" @click="detect">
        Mark condition detected</button
      ><label class="field"
        >Diagnosis<select
          v-model="diagnosis"
          :disabled="detected === null || diagnosed !== null"
        >
          <option value="" disabled>Choose the condition</option>
          <option value="rising">Temperature rising above target</option>
          <option value="proof">Fan command and proof disagree</option>
          <option value="stale">
            Temperature is retained; current value unknown
          </option>
        </select></label
      ><button
        :disabled="detected === null || diagnosed !== null || !diagnosis"
        @click="diagnose"
      >
        Record diagnosis</button
      ><label class="field"
        >Appropriate next response<input
          v-model="response"
          maxlength="500"
          :disabled="diagnosed === null" /></label
      ><button
        :disabled="diagnosed === null || !response.trim()"
        @click="finish"
      >
        Finish and save locally
      </button></template
    >
    <p v-if="warning" role="status">{{ warning }}</p>
    <div v-if="records.length" class="comparison-table-wrap">
      <table class="comparison-table">
        <caption>
          Last
          {{
            records.length
          }}
          local runs · cumulative seconds from start
        </caption>
        <thead>
          <tr>
            <th>Display / condition</th>
            <th>Detect</th>
            <th>Diagnose</th>
            <th>Respond</th>
            <th>Reasoning</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, i) in records" :key="i">
            <td>{{ record.display }} / {{ record.scenario }}</td>
            <td>{{ (record.detectedMs / 1000).toFixed(1) }}</td>
            <td>{{ (record.diagnosedMs / 1000).toFixed(1) }}</td>
            <td>{{ (record.responseMs / 1000).toFixed(1) }}</td>
            <td>
              {{ record.correct ? "Diagnosis matched" : "Review diagnosis" }} ·
              {{ record.response }}
            </td>
          </tr>
        </tbody>
      </table>
      <button @click="clear">Clear local timed runs</button>
    </div>
    <p class="source">
      § 4.4.3; 8.1(b) · Standard guidance; the timing protocol is an ACE
      exercise. Records remain browser-local and are never added to quiz-result
      submissions. A facilitator must assess the written response against site
      procedures.
    </p>
  </section>
</template>
