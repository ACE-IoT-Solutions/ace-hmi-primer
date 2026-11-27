<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import { buildingCondition } from "../lib/building-hierarchy";
import { waterDiagnostic } from "../lib/coil-diagnostics";
import { useTemperatureUnits } from "../lib/units";
const props = defineProps<{
  snapshot: LabSnapshot;
  target: number;
  assignment: string;
}>();
const emit = defineEmits<{ investigate: [] }>();
const units = useTemperatureUnits();
const condition = computed(() =>
  buildingCondition(props.snapshot, props.target),
);
const plant = computed(() =>
  props.snapshot.commState === "disconnected"
    ? "Current utility condition unknown"
    : props.snapshot.alarms.some((a) => a.id === "chiller-trip")
      ? "HIGH · Chiller-01 trip · upstream of AHU-01"
      : waterDiagnostic(props.snapshot).warm
        ? "Water warm at AHU inlet · verify upstream supply"
        : props.snapshot.points.enteringWater.quality === "good" &&
            props.snapshot.enteringWater !== null
          ? `Water at AHU inlet ${units.temperature(props.snapshot.enteringWater)} · flow not measured`
          : "Water supply observation unavailable",
);
</script>
<template>
  <div class="building-overview">
    <p class="hierarchy-scope">
      {{
        assignment === "campus"
          ? "Campus facilities operator · West, East and central utilities"
          : "West building operator · air systems, occupied areas and utility interface"
      }}
    </p>
    <div class="overview-areas">
      <article class="area-card selected-area">
        <span class="eyebrow">{{
          assignment === "campus" ? "WEST BUILDING" : "WEST / AIR SYSTEMS"
        }}</span>
        <h4>{{ condition }}</h4>
        <p>
          AHU-01 supply {{ units.temperature(snapshot.actual) }} / target
          {{ units.temperature(target)
          }}{{ snapshot.stale ? " · retained" : "" }}
        </p>
        <p>
          Serves Floors 1–2 · follow the affected service before opening point
          details.
        </p>
        <button class="primary" @click="emit('investigate')">
          Investigate West air service
        </button>
      </article>
      <article class="area-card">
        <span class="eyebrow">{{
          assignment === "campus" ? "EAST BUILDING" : "WEST / OTHER SERVICES"
        }}</span>
        <h4>
          {{
            snapshot.commState === "disconnected"
              ? "Current service unknown"
              : "Reference air service within target"
          }}
        </h4>
        <p>
          {{ assignment === "campus" ? "East AHU-02" : "West AHU-02" }} supply
          {{ units.temperature(16.3) }} / target {{ units.temperature(16) }}.
        </p>
        <p>
          {{
            snapshot.commState === "disconnected"
              ? "Retained reference values · quality unknown"
              : "Stable reference snapshot · quality good · no active sample alarms"
          }}.
        </p>
        <p class="source">
          Independent fixed teaching row; other services are outside this
          example, not assumed healthy.
        </p>
      </article>
      <article class="area-card">
        <span class="eyebrow">{{
          assignment === "campus"
            ? "CENTRAL UTILITIES"
            : "CHILLED-WATER INTERFACE"
        }}</span>
        <h4>{{ plant }}</h4>
        <p>
          Central plant → AHU-01 coil → West air service. A shared utility can
          affect several consumers.
        </p>
      </article>
    </div>
    <p
      v-for="alarm in snapshot.alarms.filter(
        (a) => a.kind === 'alarm' && a.priority === 'high',
      )"
      :key="alarm.id"
      class="overview-alarm"
    >
      HIGH · {{ alarm.equipment }} · {{ alarm.message }} ·
      {{ alarm.acknowledged ? "Acknowledged" : "Unacknowledged" }}
    </p>
    <ol class="building-dependency" aria-label="Building service dependency">
      <li>Central plant / chilled water</li>
      <li>AHU-01 / supply air</li>
      <li>West Floors 1–2 / occupied areas</li>
    </ol>
    <p class="source">
      No routine target entry at this level. The overview keeps abnormal
      conditions and functional dependencies visible across the operator’s
      responsibility.
    </p>
  </div>
</template>
<style scoped>
.overview-areas {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
.area-card {
  padding: 1rem;
  border: 1px solid #9ba7b2;
  background: #fafbfc;
}
.area-card h4 {
  font-size: 1.1rem;
  margin: 0.6rem 0;
}
.area-card p {
  font-size: 0.9rem;
}
.selected-area {
  border-top: 4px solid #365164;
}
.area-card .eyebrow {
  color: #365164;
}
.area-card button {
  width: 100%;
}
.building-dependency {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  list-style: none;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.building-dependency li {
  background: #e1e5e8;
  border: 1px solid #9ba7b2;
  padding: 0.7rem;
}
.building-dependency li:not(:last-child)::after {
  content: " →";
}
@media (max-width: 800px) {
  .overview-areas {
    grid-template-columns: 1fr;
  }
}
</style>
