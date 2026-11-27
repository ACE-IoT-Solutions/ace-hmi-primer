<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { labScenarios } from "../data/lab-scenarios";
import {
  acknowledgeAlarm,
  effectiveCommand,
  type Scenario,
  type WriteState,
} from "../lib/lab";
import { provideTemperatureUnits } from "../lib/units";
import ComparisonPanel from "./ComparisonPanel.vue";
import HierarchyExplorer from "./HierarchyExplorer.vue";
import CommandDemo from "./CommandDemo.vue";
import AlarmOverview from "./AlarmOverview.vue";
import ConnectivityLab from "./ConnectivityLab.vue";
import FormattingClinic from "./FormattingClinic.vue";
import BatchCommands from "./BatchCommands.vue";
import DisplayStyles from "./DisplayStyles.vue";
import NavigationMap from "./NavigationMap.vue";
import ViewingContext from "./ViewingContext.vue";
import TimedDetection from "./TimedDetection.vue";
import LifecycleTabletop from "./LifecycleTabletop.vue";
const units = provideTemperatureUnits();
const exercise = ref("comparison"),
  scenario = ref<Scenario>("high"),
  target = ref(16);
const acknowledged = ref<string[]>([]);
const writeState = ref<WriteState>({
  phase: "idle",
  message: "No write requested.",
});
const valveWrite = ref<number | null>(null);
watch(scenario, () => {
  valveWrite.value = null;
  writeState.value = { phase: "idle", message: "No write requested." };
});
const snapshot = computed(() => {
  const base = labScenarios[scenario.value];
  return {
    ...base,
    valveCommand: effectiveCommand(
      valveWrite.value ?? base.valveCommand,
      base.points.coolingValve.override,
    ),
    writeState: writeState.value,
    valveCommandAgeSeconds:
      valveWrite.value === null ? base.valveCommandAgeSeconds : 0,
    alarms: acknowledged.value.reduce(
      (alarms, id) => acknowledgeAlarm(alarms, id),
      base.alarms,
    ),
  };
});
const exercises = [
  ["comparison", "Display comparison"],
  ["hierarchy", "Four display levels in buildings"],
  ["alarms", "S1 · Cascading upset and alarms"],
  ["writes", "S2–S3 · Override and write lifecycle"],
  ["connection", "S4–S5 · Display health and notification"],
  ["formatting", "S6 · Formatting and entry clinic"],
  ["batch", "S7 · Multi-unit commands"],
  ["styles", "S8 · Display-style selection"],
  ["navigation", "S9 · Navigation map"],
  ["viewing", "S10 · Devices and viewing"],
  ["timing", "S11 · Timed detection run"],
  ["lifecycle", "S12 · Lifecycle tabletop"],
];
function selectExercise() {
  if (exercise.value === "alarms") scenario.value = "cascade";
  if (exercise.value === "writes") scenario.value = "override";
  if (exercise.value === "connection") scenario.value = "disconnected";
}
</script>
<template>
  <section class="page-heading">
    <span class="eyebrow">Explore / Design lab</span>
    <h1>See what the operator sees.</h1>
    <p>
      Compare presentation with process evidence, then practice alarms,
      overrides, interaction, navigation and lifecycle decisions. Every value is
      simulated.
    </p>
  </section>
  <div class="panel lab-exercise-picker">
    <label class="field"
      >Lab exercise<select v-model="exercise" @change="selectExercise">
        <option v-for="item in exercises" :key="item[0]" :value="item[0]">
          {{ item[1] }}
        </option>
      </select></label
    ><label class="field"
      >Temperature units<select v-model="units.unit.value">
        <option value="C">Celsius · °C</option>
        <option value="F">Fahrenheit · °F</option>
      </select></label
    >
    <p class="source">
      Choose the units used at your site. Values convert from the same
      underlying data; changing units does not change the process. § 5.1.3(d),
      7.2.1.2 · Standard guidance.
    </p>
  </div>
  <template v-if="exercise === 'comparison'"
    ><ComparisonPanel
      v-model:scenario="scenario"
      :snapshot="snapshot"
      :target="target"
    /><CommandDemo
      :key="scenario"
      v-model:target="target"
      :snapshot="snapshot"
      @state="writeState = $event"
      @valve-accepted="valveWrite = $event"
    />
    <div class="panel exercise-panel">
      <h2>Where does each kind of evidence belong?</h2>
      <p>
        Follow the same building case through overview, operation, equipment
        detail and point diagnostics.
      </p>
      <button @click="exercise = 'hierarchy'">
        Explore four display levels in buildings
      </button>
    </div>
  </template>
  <HierarchyExplorer
    v-else-if="exercise === 'hierarchy'"
    v-model:scenario="scenario"
    v-model:target="target"
    :snapshot="snapshot"
    @state="writeState = $event"
    @valve-accepted="valveWrite = $event"
  />
  <AlarmOverview
    v-else-if="exercise === 'alarms'"
    :snapshot="snapshot"
    @acknowledge="(id) => acknowledged.push(id)"
  />
  <template v-else-if="exercise === 'writes'"
    ><div class="panel exercise-panel">
      <span class="eyebrow">S2 · Override hidden in plain sight</span>
      <h2>Automatic demand is not the effective command.</h2>
      <p v-if="snapshot.points.coolingValve.override">
        The loop asks for {{ snapshot.controlDemand }}%; a priority-8
        maintenance override holds the effective valve command at
        {{ snapshot.valveCommand }}%. Source: Maintenance technician · age: 2
        hours. This is an illustrative BACnet override, not a complete
        priority-array implementation.
      </p>
      <p v-else>
        Override released. Automatic demand is {{ snapshot.controlDemand }}%;
        effective command is {{ snapshot.valveCommand }}%. A new valve write can
        now be accepted.
      </p>
      <div class="actions">
        <button @click="scenario = 'override'">
          Apply maintenance override</button
        ><button @click="scenario = 'high'">Release simulated override</button>
      </div>
      <p class="source">
        § 9.1.1(c, k); 7.2.1.4(a) · Standard training guidance and ACE applied
        practice.
      </p>
    </div>
    <CommandDemo
      :key="scenario"
      v-model:target="target"
      :snapshot="snapshot"
      valve-mode
      @state="writeState = $event"
      @valve-accepted="valveWrite = $event"
  /></template>
  <ConnectivityLab v-else-if="exercise === 'connection'" :snapshot="snapshot" />
  <FormattingClinic v-else-if="exercise === 'formatting'" />
  <BatchCommands v-else-if="exercise === 'batch'" />
  <DisplayStyles v-else-if="exercise === 'styles'" />
  <NavigationMap v-else-if="exercise === 'navigation'" />
  <ViewingContext
    v-else-if="exercise === 'viewing'"
    :snapshot="snapshot"
    :target="target"
  />
  <TimedDetection v-else-if="exercise === 'timing'" />
  <LifecycleTabletop v-else-if="exercise === 'lifecycle'" />
</template>
