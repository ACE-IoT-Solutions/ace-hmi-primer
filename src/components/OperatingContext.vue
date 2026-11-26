<script setup lang="ts">
import { computed } from "vue";
import { useTemperatureUnits } from "../lib/units";
import TemperatureTrend from "./TemperatureTrend.vue";
import ProcessIntegrity from "./ProcessIntegrity.vue";
const units = useTemperatureUnits();
import { temperatureState, type LabSnapshot } from "../lib/lab";
const props = defineProps<{
  snapshot: LabSnapshot;
  target: number;
}>();
const state = computed(() =>
  temperatureState(
    props.snapshot.actual,
    props.target,
    props.snapshot.stale,
    units.delta,
  ),
);
const mismatch = computed(
  () => props.snapshot.fanCommand !== props.snapshot.fanProof,
);
</script>
<template>
  <div class="operating-context">
    <ProcessIntegrity :snapshot="snapshot" />
    <p v-if="snapshot.writeState.phase !== 'idle'" class="shared-write-state">
      Write {{ snapshot.writeState.phase }} · {{ snapshot.writeState.message }}
    </p>
    <div
      :class="['screen-status', { attention: state.attention || mismatch }]"
      role="status"
    >
      <strong>{{
        mismatch
          ? "⚠ Fan command / proof mismatch"
          : `${state.attention ? "⚠ " : ""}${state.label}`
      }}</strong>
      <span>{{
        mismatch
          ? "Command ON · Run proof OFF · investigate equipment status"
          : state.description
      }}</span>
    </div>
    <div class="measurement">
      <div>
        <span>{{
          snapshot.stale
            ? "Last known supply temperature"
            : "Supply air temperature"
        }}</span
        ><strong
          >{{ units.value(snapshot.actual) }}
          <small>{{ units.label() }}</small></strong
        >
      </div>
      <div>
        <span>Accepted target</span
        ><strong
          >{{ units.value(target) }} <small>{{ units.label() }}</small></strong
        >
      </div>
    </div>
    <div class="operating-signals">
      <div>
        <span>Cooling valve command</span
        ><strong
          >{{ snapshot.valveCommand }}% · Automatic demand
          {{ snapshot.controlDemand }}%</strong
        >
      </div>
      <div :class="{ 'signal-mismatch': mismatch }">
        <span>Supply fan</span
        ><strong>
          {{ snapshot.commState === "disconnected" ? "Retained: " : "" }}Command
          {{ snapshot.fanCommand ? "ON" : "OFF" }} / Proof
          {{ snapshot.fanProof ? "ON" : "OFF" }}</strong
        >
      </div>
      <p>
        {{
          snapshot.stale
            ? "Temperature quality: STALE · last update 12 min ago"
            : `Temperature quality: good · deviation ${snapshot.actual - target > 0 ? "+" : ""}${units.delta(snapshot.actual - target)}`
        }}
      </p>
    </div>
    <TemperatureTrend :snapshot="snapshot" :target="target" />
  </div>
</template>
