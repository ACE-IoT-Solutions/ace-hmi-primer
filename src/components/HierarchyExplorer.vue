<script setup lang="ts">
import { computed, ref } from "vue";
import type { LabSnapshot } from "../lib/lab";
import { useTemperatureUnits } from "../lib/units";
const props = defineProps<{ snapshot: LabSnapshot }>();
const units = useTemperatureUnits();
const level = ref(2);
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
      `Cooling valve command · ${props.snapshot.valveCommand}%`,
      "Chilled-water availability · available",
      "Fan start permissive · satisfied; freeze interlock · inactive",
      `Supply fan · command ${props.snapshot.fanCommand ? "ON" : "OFF"} / proof ${props.snapshot.fanProof ? "ON" : "OFF"}`,
    ],
    note: "Subsystem detail supports diagnosis. A valve command does not prove valve movement, flow, or cooling capacity. These values are fixed teaching examples.",
  },
  {
    name: "Diagnostics",
    scope: "Focused diagnostics, procedures and help",
    task: "Can I trust this observation?",
    items: [
      `Point · AHU01.SAT · ${units.label()}`,
      `Illustrative range · ${units.temperature(-10)} to ${units.temperature(60)}`,
      "Communication quality and last update",
      "Equipment operating procedure and diagnostic help",
      "Freeze safety shutdown, interlocks and start permissives",
    ],
    note: "Focused diagnostics can live in a faceplate or popup. Show data-quality and device evidence here; avoid making this the only place an operator can notice lost data.",
  },
]);
</script>
<template>
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
</template>
