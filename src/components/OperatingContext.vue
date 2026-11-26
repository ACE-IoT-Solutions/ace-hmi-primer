<script setup lang="ts">
import { computed } from "vue";
import { useTemperatureUnits } from "../lib/units";
import { valveDiagnostic, waterDiagnostic } from "../lib/coil-diagnostics";
import ValveProof from "./ValveProof.vue";
import WaterDiagnostics from "./WaterDiagnostics.vue";
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
const valve = computed(() => valveDiagnostic(props.snapshot));
const water = computed(() => waterDiagnostic(props.snapshot));
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
      :class="[
        'screen-status',
        {
          attention:
            state.attention || mismatch || valve.mismatch || water.warm,
        },
      ]"
      role="status"
    >
      <strong>{{
        mismatch
          ? "⚠ Fan command / proof mismatch"
          : valve.mismatch
            ? `⚠ ${valve.label}`
            : water.warm
              ? "⚠ Entering water above example supply range"
              : `${state.attention ? "⚠ " : ""}${state.label}`
      }}</strong>
      <span>{{
        mismatch
          ? "Command ON · Run proof OFF · investigate equipment status"
          : valve.mismatch
            ? valve.detail
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
    <section
      class="coil-diagnostic-panel"
      aria-label="Valve travel and coil response"
    >
      <div>
        <h3>Valve travel / independent position feedback</h3>
        <ValveProof :snapshot="snapshot" />
      </div>
      <WaterDiagnostics :snapshot="snapshot" />
      <p class="coil-basis">
        Installed diagnostic points in this teaching example. Sample ages,
        position tolerance, travel allowance and water supply range are
        illustrative site settings, not universal requirements.
      </p>
    </section>
    <TemperatureTrend :snapshot="snapshot" :target="target" />
  </div>
</template>

<style scoped>
.coil-diagnostic-panel {
  margin: 1.5rem;
  padding: 1rem;
  border: 1px solid #9ba7b2;
  background: #fafbfc;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}
.coil-diagnostic-panel h3 {
  font-size: 1rem;
  margin: 0 0 0.6rem;
}
.coil-basis {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 0.8rem;
  color: #495765;
}
@media (max-width: 720px) {
  .coil-diagnostic-panel {
    grid-template-columns: 1fr;
    margin: 1rem;
  }
}
</style>
