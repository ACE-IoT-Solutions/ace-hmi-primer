<script setup lang="ts">
import type { LabSnapshot } from "../lib/lab";
defineProps<{ snapshot: LabSnapshot }>();
</script>
<template>
  <div
    v-if="snapshot.commState === 'disconnected'"
    class="display-failure"
    role="alert"
  >
    <strong>Display connection lost</strong
    ><span
      >All process values retained · last contact 12 min ago · current process
      state unknown</span
    >
  </div>
  <div v-if="snapshot.points.coolingValve.override" class="override-indication">
    <strong>Operator override active</strong
    ><span
      >Automatic demand {{ snapshot.controlDemand }}% · Effective valve command
      {{ snapshot.valveCommand }}%</span
    ><span
      >Priority {{ snapshot.points.coolingValve.override.priority }} ·
      {{ snapshot.points.coolingValve.override.source }} · set
      {{ snapshot.points.coolingValve.override.since }}</span
    >
  </div>
  <div v-if="snapshot.alarms.length" class="snapshot-alarms">
    <strong
      >{{ snapshot.alarms.filter((a) => a.kind === "alarm").length }} active
      alarms ·
      {{ snapshot.alarms.filter((a) => a.kind === "alert").length }} maintenance
      alert</strong
    ><span v-for="alarm in snapshot.alarms" :key="alarm.id"
      >{{ alarm.kind === "alarm" ? alarm.priority.toUpperCase() : "Alert" }} ·
      {{ alarm.equipment }} · {{ alarm.message }} ·
      {{ alarm.acknowledged ? "Acknowledged" : "Unacknowledged" }}</span
    >
  </div>
</template>
