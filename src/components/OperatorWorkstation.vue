<script setup lang="ts">
import { computed, ref } from "vue";
import type { LabSnapshot } from "../lib/lab";
import { buildingCondition } from "../lib/building-hierarchy";
const props = defineProps<{
  snapshot: LabSnapshot;
  target: number;
  level: number;
  assignment: string;
}>();
const emit = defineEmits<{
  navigate: [level: number];
  acknowledge: [id: string];
}>();
const eventsOpen = ref(false);
const titles = [
  "Site overview",
  "West air systems",
  "AHU-01 cooling circuit",
  "Point inspector",
];
const condition = computed(() =>
  buildingCondition(props.snapshot, props.target).replace(
    "example supply range",
    "supply limit",
  ),
);
const attention = computed(() => condition.value !== "Within operating band");
</script>
<template>
  <section
    class="operator-workstation"
    aria-label="Simulated facilities operator workstation"
  >
    <header class="ws-titlebar">
      <div class="ws-brand">ACE <span>FACILITY OPERATIONS</span></div>
      <span>{{
        assignment === "campus" ? "NORTH CAMPUS" : "WEST BUILDING"
      }}</span
      ><span class="ws-simulation">SIMULATION / FIXED SNAPSHOT</span>
    </header>
    <nav class="ws-nav" aria-label="Workstation displays">
      <button
        v-for="(title, i) in titles"
        :key="title"
        :aria-label="`Workstation: ${title}`"
        :aria-current="level === i + 1 ? 'page' : undefined"
        @click="emit('navigate', i + 1)"
      >
        <small>0{{ i + 1 }}</small
        >{{ title }}</button
      ><button
        class="ws-events-toggle"
        :aria-expanded="eventsOpen"
        @click="eventsOpen = !eventsOpen"
      >
        Events &amp; alarms · {{ snapshot.alarms.length + (attention ? 1 : 0) }}
      </button>
    </nav>
    <div
      class="ws-condition"
      :class="{
        'ws-attention': attention,
        'ws-lost': snapshot.commState === 'disconnected',
      }"
      role="status"
    >
      <strong>{{ attention ? "△" : "●" }} {{ condition }}</strong
      ><span>{{
        snapshot.points.coolingValve.override
          ? "OPERATOR OVERRIDE ACTIVE"
          : "AHU-01 / WEST AIR SERVICE"
      }}</span>
    </div>
    <div
      v-if="eventsOpen"
      class="ws-event-tray"
      aria-label="Workstation event tray"
    >
      <div class="ws-panel-heading">
        <strong>Event summary</strong
        ><span>{{
          snapshot.commState === "disconnected"
            ? "Retained list · current alarm state unverified"
            : "Current snapshot"
        }}</span>
      </div>
      <p v-if="attention" class="ws-diagnostic-event">
        DIAGNOSTIC · {{ condition }}
      </p>
      <table v-if="snapshot.alarms.length">
        <thead>
          <tr>
            <th>Priority / type</th>
            <th>Equipment</th>
            <th>Message</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alarm in snapshot.alarms" :key="alarm.id">
            <td>
              {{
                alarm.kind === "alarm"
                  ? alarm.priority.toUpperCase()
                  : "MAINTENANCE"
              }}
            </td>
            <td>{{ alarm.equipment }}</td>
            <td>{{ alarm.message }}</td>
            <td>
              <span>{{ alarm.active ? "ACTIVE" : "INACTIVE" }} · </span
              ><button
                v-if="alarm.kind === 'alarm'"
                :disabled="alarm.acknowledged"
                @click="emit('acknowledge', alarm.id)"
              >
                {{
                  alarm.acknowledged ? "Acknowledged" : "Acknowledge"
                }}</button
              ><span v-else>Maintenance queue</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>No configured alarm records in this snapshot.</p>
    </div>
    <div class="ws-documentbar">
      <strong>{{ titles[level - 1] }}</strong
      ><span>{{
        level > 1
          ? "West building / AHU-01 / Floors 1–2"
          : "Utilities and served buildings"
      }}</span
      ><span>DISPLAY {{ level.toString().padStart(2, "0") }}</span>
    </div>
    <div class="ws-canvas"><slot /></div>
    <footer class="ws-footer">
      <span :class="{ 'ws-bad-text': snapshot.commState === 'disconnected' }">{{
        snapshot.commState === "disconnected"
          ? "■ CONTROLLER LINK LOST · VALUES RETAINED"
          : "● CONTROLLER CONNECTED"
      }}</span
      ><span>{{
        snapshot.writeState.phase === "idle"
          ? "No pending writes"
          : `WRITE ${snapshot.writeState.phase.toUpperCase()} · ${snapshot.writeState.message}`
      }}</span
      ><span>{{
        Object.values(snapshot.points).some((p) => p.quality !== "good")
          ? "POINT QUALITY REQUIRES ATTENTION"
          : "POINT QUALITY GOOD"
      }}</span>
    </footer>
  </section>
</template>
<style src="../workstation.css"></style>
