<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import { buildingCondition } from "../lib/building-hierarchy";
import { valveDiagnostic, waterDiagnostic } from "../lib/coil-diagnostics";
import { useTemperatureUnits } from "../lib/units";
const props = defineProps<{
  snapshot: LabSnapshot;
  target: number;
  assignment: string;
}>();
const emit = defineEmits<{ investigate: [] }>();
const units = useTemperatureUnits();
const lost = computed(() => props.snapshot.commState === "disconnected");
const attention = computed(
  () =>
    buildingCondition(props.snapshot, props.target) !== "Within operating band",
);
const status = computed(() =>
  lost.value
    ? "LINK LOST"
    : props.snapshot.stale
      ? "SAT STALE"
      : valveDiagnostic(props.snapshot).mismatch
        ? "VALVE TRACKING"
        : waterDiagnostic(props.snapshot).warm
          ? "WATER SUPPLY WARM"
          : props.snapshot.fanCommand !== props.snapshot.fanProof
            ? "FAN PROOF LOST"
            : props.snapshot.points.valvePosition.quality !== "good"
              ? "FEEDBACK STALE"
              : attention.value
                ? "SUPPLY AIR HIGH"
                : "WITHIN BAND",
);
</script>
<template>
  <svg
    class="ws-diagram campus-service-graphic"
    viewBox="0 0 780 460"
    role="group"
    aria-label="Campus building and chilled-water service graphic"
  >
    <rect width="780" height="460" fill="#f0f3f4" />
    <path d="M0 330H780M450 0V460" stroke="#dbe1e4" stroke-width="36" />
    <path
      d="M0 330H780M450 0V460"
      stroke="#bfc9ce"
      stroke-width="1"
      stroke-dasharray="12 8"
    />
    <text x="500" y="320" class="svg-small">SERVICE ROAD</text>
    <text x="22" y="28" class="svg-label">
      {{
        assignment === "campus"
          ? "NORTH CAMPUS / SERVICE OVERVIEW"
          : "WEST BUILDING / SERVICE OVERVIEW"
      }}
    </text>
    <g
      class="svg-click"
      role="button"
      tabindex="0"
      aria-label="Investigate West air service"
      @click="emit('investigate')"
      @keydown.enter="emit('investigate')"
      @keydown.space.prevent="emit('investigate')"
    >
      <path
        d="M45 80H306V146H345V273H45Z"
        fill="#e2e7ea"
        stroke="#8b9ba6"
        stroke-width="2"
      />
      <path d="M70 102H275V240H70Z" fill="none" stroke="#b4c0c7" />
      <path
        d="M120 102V240M175 102V240M230 102V240M70 149H275M70 195H275"
        stroke="#c0cbd1"
      />
      <rect
        class="svg-box"
        :class="{ 'svg-attention': attention }"
        x="70"
        y="122"
        width="250"
        height="130"
        rx="3"
      />
      <text x="86" y="148" class="svg-label">WEST / AHU-01</text>
      <text x="86" y="176" class="svg-value">
        {{ units.temperature(snapshot.actual) }}
      </text>
      <text x="86" y="198" class="svg-small">
        Target {{ units.temperature(target) }} · Floors 1–2
      </text>
      <text x="86" y="228" class="svg-label">
        {{ attention ? "△" : "●" }} {{ status }} ↗
      </text>
    </g>
    <g>
      <path
        d="M500 80H733V270H500Z"
        fill="#e3e8eb"
        stroke="#8b9ba6"
        stroke-width="2"
      />
      <path
        d="M522 102H710V244H522ZM583 102V244M648 102V244M522 149H710M522 195H710"
        fill="none"
        stroke="#c0cbd1"
      />
      <rect x="516" y="123" width="200" height="118" class="svg-box" rx="3" />
      <text x="532" y="149" class="svg-label">
        {{ assignment === "campus" ? "EAST / AHU-02" : "WEST / AHU-02" }}
      </text>
      <text x="532" y="178" class="svg-value">
        {{ units.temperature(16.3) }}
      </text>
      <text x="532" y="201" class="svg-small">
        Target {{ units.temperature(16) }} · stable
      </text>
      <text x="532" y="223" class="svg-small">
        {{ lost ? "RETAINED / UNVERIFIED" : "REFERENCE SERVICE" }}
      </text>
    </g>
    <path
      d="M194 273V300H617V273M395 300V359"
      class="svg-pipe"
      :stroke-dasharray="lost ? '8 6' : undefined"
    />
    <rect
      x="256"
      y="353"
      width="286"
      height="86"
      class="svg-box"
      :class="{
        'svg-attention':
          waterDiagnostic(snapshot).warm ||
          snapshot.alarms.some((a) => a.id === 'chiller-trip'),
      }"
      rx="3"
    />
    <path d="M274 382h30v30h-30zM279 387l20 20m0-20l-20 20" class="svg-line" />
    <text x="319" y="377" class="svg-label">CENTRAL CHILLED WATER</text>
    <text x="319" y="401">
      {{
        snapshot.alarms.some((a) => a.id === "chiller-trip")
          ? "CH-01 TRIP"
          : "WEST BRANCH INLET"
      }}
    </text>
    <text x="319" y="424" class="svg-small">
      {{
        snapshot.enteringWater === null
          ? "—"
          : units.temperature(snapshot.enteringWater)
      }}
      ·
      {{
        lost ? "UNKNOWN" : snapshot.points.enteringWater.quality.toUpperCase()
      }}
    </text>
    <text x="30" y="405" class="svg-small">CHW service connection</text>
    <text x="30" y="425" class="svg-small">Flow not metered</text>
    <text x="640" y="429" class="svg-small">N ↑</text>
  </svg>
</template>
