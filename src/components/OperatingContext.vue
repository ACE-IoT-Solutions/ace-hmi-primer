<script setup lang="ts">
import { computed } from "vue";
import { useTemperatureUnits } from "../lib/units";
import ProcessIntegrity from "./ProcessIntegrity.vue";
const units = useTemperatureUnits();
import { temperatureState, type LabSnapshot } from "../lib/lab";
const props = defineProps<{
  snapshot: LabSnapshot;
  target: number;
  mimic?: boolean;
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
const y = (value: number) => 150 - ((value - 12) / 16) * 125;
const points = computed(() =>
  props.snapshot.trend
    .map((v, i) => `${60 + i * 82 * (props.snapshot.stale ? 0.6 : 1)},${y(v)}`)
    .join(" "),
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
        mimic ? 'mimic-context-status' : 'screen-status',
        { attention: state.attention || mismatch },
      ]"
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
        ><strong>{{ snapshot.valveCommand }}%</strong>
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
    <div class="trend-panel">
      <div class="section-top">
        <strong>Supply temperature · {{ units.label() }}</strong
        ><span>{{
          snapshot.stale
            ? "Historical data ending 12 min ago"
            : "Last 30 minutes"
        }}</span>
      </div>
      <svg
        viewBox="0 0 520 195"
        role="img"
        :aria-label="`Supply temperature trend: ${snapshot.trend.map((v) => units.temperature(v)).join(', ')}. Target ${units.temperature(target)}. ${snapshot.stale ? 'Ends 12 minutes ago; no current data.' : 'Over the last 30 minutes.'}`"
      >
        <rect
          x="60"
          :y="y(target + 2)"
          width="410"
          :height="y(target - 2) - y(target + 2)"
          fill="#e1e4e7"
        />
        <g v-for="tick in [12, 16, 20, 24, 28]" :key="tick">
          <line x1="60" x2="470" :y1="y(tick)" :y2="y(tick)" stroke="#ccd1d6" />
          <text x="25" :y="y(tick) + 5">{{ units.value(tick) }}</text>
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
        <rect
          v-if="snapshot.stale"
          class="missing-data-region"
          x="306"
          y="18"
          width="164"
          height="132"
          fill="#e8ecf1"
          opacity=".7"
        />
        <text v-if="snapshot.stale" x="320" y="40">No current data</text>
        <circle
          :cx="snapshot.stale ? 306 : 470"
          :cy="y(snapshot.actual)"
          r="5"
          fill="#174c7c"
        />
        <text x="60" y="184">30 min ago</text>
        <text v-if="snapshot.stale" x="270" y="166">12 min ago</text>
        <text x="400" y="184">Now</text>
      </svg>
      <p>
        Solid: measured temperature · Dashed: accepted target · Shaded:
        illustrative ±{{ units.delta(2) }} band
      </p>
    </div>
  </div>
</template>
