<script setup lang="ts">
import { computed } from "vue";
import { useTemperatureUnits } from "../lib/units";
import type { LabSnapshot } from "../lib/lab";
const units = useTemperatureUnits();
const props = defineProps<{ snapshot: LabSnapshot; target: number }>();
const y = (value: number) => 150 - ((value - 12) / 16) * 125;
const points = computed(() =>
  props.snapshot.trend
    .map((v, i) => `${60 + i * 82 * (props.snapshot.stale ? 0.6 : 1)},${y(v)}`)
    .join(" "),
);
</script>
<template>
  <div class="trend-panel">
    <div class="section-top">
      <strong>Supply temperature · {{ units.label() }}</strong
      ><span>{{
        snapshot.stale ? "Historical data ending 12 min ago" : "Last 30 minutes"
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
</template>
