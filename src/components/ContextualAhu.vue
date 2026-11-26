<script setup lang="ts">
import { computed } from "vue";
import AnimatedAhu from "./AnimatedAhu.vue";
import TemperatureTrend from "./TemperatureTrend.vue";
import { temperatureState, type LabSnapshot } from "../lib/lab";
import { useTemperatureUnits } from "../lib/units";
const props = defineProps<{
  snapshot: LabSnapshot;
  target: number;
  paused: boolean;
}>();
const units = useTemperatureUnits();
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
const disconnected = computed(
  () => props.snapshot.commState === "disconnected",
);
</script>
<template>
  <div class="contextual-ahu">
    <p v-if="snapshot.writeState.phase !== 'idle'" class="shared-write-state">
      Write {{ snapshot.writeState.phase }} · {{ snapshot.writeState.message }}
    </p>
    <AnimatedAhu :snapshot="snapshot" :paused="paused" contextual>
      <svg class="context-leaders" viewBox="0 0 900 540" aria-hidden="true">
        <path
          d="M359 147V-40M551 212V-40M764 300V560H735M764 300L230 460V560"
        />
        <circle
          v-for="point in [
            [359, 147],
            [551, 212],
            [764, 300],
          ]"
          :key="point.join()"
          :cx="point[0]"
          :cy="point[1]"
          r="5"
        />
      </svg>
      <section
        class="equipment-callout valve-callout"
        aria-label="Cooling coil operating context"
      >
        <span class="callout-label">Cooling coil / valve</span>
        <strong
          >{{ disconnected ? "Retained command" : "Effective command" }}
          {{ snapshot.valveCommand }}%</strong
        >
        <span>Automatic demand {{ snapshot.controlDemand }}%</span>
        <template v-if="snapshot.points.coolingValve.override">
          <strong class="callout-warning"
            >Operator override active · Priority
            {{ snapshot.points.coolingValve.override.priority }}</strong
          >
          <small
            >{{ snapshot.points.coolingValve.override.source }} · set
            {{ snapshot.points.coolingValve.override.since }}</small
          >
        </template>
        <small v-else>No operator override</small>
      </section>
      <section
        class="equipment-callout fan-callout"
        :class="{ attention: mismatch }"
        aria-label="Supply fan operating context"
      >
        <span class="callout-label">Supply fan / measured run proof</span>
        <strong
          >{{ disconnected ? "Retained: " : "" }}Command
          {{ snapshot.fanCommand ? "ON" : "OFF" }} / Proof
          {{ snapshot.fanProof ? "ON" : "OFF" }}</strong
        >
        <span v-if="disconnected">Current equipment state unknown</span>
        <span v-else-if="mismatch" class="callout-warning"
          >⚠ Fan command / proof mismatch</span
        >
        <span v-else>Command and proof agree</span>
        <small>Rotation follows command; airflow is unmeasured.</small>
      </section>
      <section
        class="equipment-callout temperature-callout"
        :class="{ attention: state.attention }"
        aria-label="Supply temperature operating context"
        role="status"
      >
        <span class="callout-label"
          >Supply air / {{ snapshot.stale ? "last known" : "measured" }}</span
        >
        <strong class="context-temperature">{{
          units.temperature(snapshot.actual)
        }}</strong>
        <span>Accepted target {{ units.temperature(target) }}</span>
        <strong>{{ state.label }}</strong>
        <span>{{ state.description }}</span>
        <small>{{
          snapshot.stale
            ? "Temperature quality: STALE · last update 12 min ago"
            : `Temperature quality: good · deviation ${snapshot.actual - target > 0 ? "+" : ""}${units.delta(snapshot.actual - target)}`
        }}</small>
      </section>
      <section
        class="equipment-callout history-callout"
        aria-label="Supply air history at the outlet"
      >
        <TemperatureTrend :snapshot="snapshot" :target="target" />
      </section>
      <span class="return-air-label"
        >Return air {{ units.temperature(23)
        }}{{ disconnected ? " · retained" : "" }}</span
      >
    </AnimatedAhu>
  </div>
</template>
<style scoped>
.equipment-callout {
  position: absolute;
  background: #142b3c;
  color: #e1eef5;
  border: 1px solid #7ba7bf;
  border-radius: 6px;
  padding: 0.8rem 1rem;
  display: grid;
  gap: 0.3rem;
  font-size: 0.9rem;
  line-height: 1.4;
  box-shadow: 0 3px 12px #0003;
}
.callout-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #bcd6e5;
}
.equipment-callout small {
  color: #c2d9e8;
}
.valve-callout {
  top: 1rem;
  left: 20%;
  width: 35%;
}
.fan-callout {
  top: 1rem;
  right: 1rem;
  width: 39%;
}
.temperature-callout {
  bottom: 1rem;
  right: 1rem;
  width: 37%;
}
.context-temperature {
  font-size: 1.7rem;
  color: #b0edff;
}
.history-callout {
  bottom: 1rem;
  left: 1rem;
  width: 57%;
  padding: 0.5rem;
}
.history-callout :deep(.trend-panel) {
  margin: 0;
  padding: 0.6rem;
  color: #263441;
}
.history-callout :deep(.section-top) {
  flex-wrap: wrap;
  gap: 0.3rem;
}
.attention {
  border-left: 4px solid #efb866;
}
.callout-warning {
  color: #ffd598;
}
.context-leaders {
  position: absolute;
  top: 10rem;
  left: 0;
  width: 100%;
  height: auto;
  overflow: visible;
  pointer-events: none;
}
.context-leaders path {
  fill: none;
  stroke: #b1cddd;
  stroke-width: 1.5;
}
.context-leaders circle {
  fill: #e1eef5;
  stroke: #142b3c;
  stroke-width: 2;
}
.return-air-label {
  position: absolute;
  left: 1rem;
  top: 48%;
  font-size: 0.85rem;
  background: #142b3c;
  padding: 0.4rem;
  border: 1px solid #7ba7bf;
}
@media (max-width: 600px) {
  .equipment-callout {
    position: static;
    width: auto;
    margin: 0.6rem 0.75rem;
    padding: 0.75rem;
  }
  .valve-callout {
    order: 0;
  }
  .fan-callout {
    order: 1;
  }
  .return-air-label {
    position: static;
    order: 3;
    margin: 0 0.75rem;
  }
  .temperature-callout {
    order: 4;
  }
  .history-callout {
    order: 5;
  }
  .context-leaders {
    display: none;
  }
}
</style>
