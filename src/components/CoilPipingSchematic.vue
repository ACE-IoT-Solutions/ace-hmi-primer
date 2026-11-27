<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import type { BuildingPoint } from "../lib/building-hierarchy";
import { valveDiagnostic, waterDiagnostic } from "../lib/coil-diagnostics";
import { useTemperatureUnits } from "../lib/units";
const props = defineProps<{ snapshot: LabSnapshot; interactive?: boolean }>();
const emit = defineEmits<{ inspect: [point: BuildingPoint] }>();
const units = useTemperatureUnits();
const mismatch = computed(() => valveDiagnostic(props.snapshot).mismatch);
const points = computed(() => [
  {
    key: "enteringWater" as const,
    label: "EWT-01",
    x: 30,
    y: 55,
    value: props.snapshot.enteringWater,
    caption: "Entering coil water",
  },
  {
    key: "leavingWater" as const,
    label: "LWT-01",
    x: 30,
    y: 250,
    value: props.snapshot.leavingWater,
    caption: "Leaving coil water",
  },
]);
</script>
<template>
  <div class="ws-schematic-scroll">
    <svg
      class="ws-diagram coil-piping-schematic"
      viewBox="0 0 780 430"
      role="group"
      aria-label="AHU cooling coil water circuit with control valve, position feedback, entering and leaving water sensors"
    >
      <rect width="780" height="430" fill="#f1f4f5" />
      <text x="22" y="28" class="svg-label">
        CC-01 / CHILLED-WATER COOLING CIRCUIT
      </text>
      <path d="M35 160H370V238H570V345H35" class="svg-pipe" />
      <text x="25" y="143" class="svg-small">CHW SUPPLY →</text>
      <text x="25" y="373" class="svg-small">← CHW RETURN</text>
      <path d="M470 148V300" stroke="#d2dce2" stroke-width="70" />
      <path
        d="M435 160H508V289H435Z"
        fill="#e2e8ec"
        stroke="#7e919d"
        stroke-width="2"
      />
      <path
        d="M441 170l60 16-60 16 60 16-60 16 60 16-60 16"
        stroke="#78909f"
        fill="none"
        stroke-width="3"
      />
      <text x="437" y="325" class="svg-label">CC-01</text>
      <text x="590" y="248" class="svg-small">Air path →</text>
      <g
        :class="{ 'svg-click': interactive }"
        :role="interactive ? 'button' : undefined"
        :tabindex="interactive ? 0 : undefined"
        aria-label="Inspect valve position point"
        @click="interactive && emit('inspect', 'valvePosition')"
        @keydown.enter="interactive && emit('inspect', 'valvePosition')"
        @keydown.space.prevent="interactive && emit('inspect', 'valvePosition')"
      >
        <rect
          x="211"
          y="63"
          width="190"
          height="66"
          class="svg-box"
          :class="{ 'svg-attention': mismatch }"
        />
        <text x="225" y="85" class="svg-label">
          CLV-01 / POSITION {{ interactive ? "↗" : "" }}
        </text>
        <text x="225" y="112" class="svg-value">
          {{ snapshot.valvePosition ?? "—" }}%
        </text>
        <path
          d="M300 160l-21-17v34Zm0 0l21-17v34Z"
          fill="#d7e1e6"
          stroke="#648294"
          stroke-width="2"
        />
        <path d="M300 160V129" class="svg-line" />
        <rect
          x="287"
          y="121"
          width="26"
          height="15"
          fill="#e2e8ec"
          stroke="#648294"
        />
      </g>
      <path
        d="M182 160l-12-8v16Zm0 0l12-8v16ZM182 345l-12-8v16Zm0 0l12-8v16Z"
        fill="#e1e7eb"
        stroke="#8a9da9"
      />
      <text x="132" y="210" class="svg-small">MANUAL ISOLATION</text>
      <text x="132" y="227" class="svg-small">Position not instrumented</text>
      <g
        v-for="sensor in points"
        :key="sensor.key"
        :class="{ 'svg-click': interactive }"
        :role="interactive ? 'button' : undefined"
        :tabindex="interactive ? 0 : undefined"
        :aria-label="`Inspect ${sensor.caption.toLowerCase()} point`"
        @click="interactive && emit('inspect', sensor.key)"
        @keydown.enter="interactive && emit('inspect', sensor.key)"
        @keydown.space.prevent="interactive && emit('inspect', sensor.key)"
      >
        <rect
          :x="sensor.x"
          :y="sensor.y"
          width="165"
          height="72"
          class="svg-box"
          :class="{
            'svg-attention':
              snapshot.points[sensor.key].quality !== 'good' ||
              (sensor.key === 'enteringWater' &&
                waterDiagnostic(snapshot).warm),
          }"
        />
        <text :x="sensor.x + 12" :y="sensor.y + 23" class="svg-label">
          {{ sensor.label }} {{ interactive ? "↗" : "" }}
        </text>
        <text :x="sensor.x + 12" :y="sensor.y + 49" class="svg-value">
          {{ sensor.value === null ? "—" : units.temperature(sensor.value) }}
        </text>
        <text :x="sensor.x + 12" :y="sensor.y + 66" class="svg-small">
          {{ snapshot.points[sensor.key].quality.toUpperCase() }}
        </text>
      </g>
      <path d="M93 127V151M93 322V335" class="svg-line" />
      <circle cx="93" cy="160" r="10" fill="#f8fafb" stroke="#648294" />
      <text x="88" y="165" class="svg-small">T</text>
      <circle cx="93" cy="345" r="10" fill="#f8fafb" stroke="#648294" />
      <text x="88" y="350" class="svg-small">T</text>
      <rect
        x="537"
        y="49"
        width="218"
        height="90"
        class="svg-box"
        :class="{ 'svg-attention': mismatch }"
      />
      <text x="551" y="72" class="svg-label">TRAVEL COMPARISON</text>
      <text x="551" y="96">
        CMD {{ snapshot.valveCommand }}% / POS
        {{ snapshot.valvePosition ?? "—" }}%
      </text>
      <text x="551" y="119" class="svg-small">
        {{ snapshot.points.valvePosition.quality.toUpperCase() }} · age
        {{ snapshot.points.valvePosition.ageSeconds ?? "—" }} s
      </text>
      <text x="538" y="380" class="svg-small">No flow meter installed</text>
      <text x="538" y="398" class="svg-small">
        Line arrows indicate design direction
      </text>
      <text x="25" y="413" class="svg-small">
        Water ΔT
        {{
          waterDiagnostic(snapshot).delta === null
            ? "UNVERIFIED"
            : units.delta(waterDiagnostic(snapshot).delta!)
        }}
        · leaving − entering
      </text>
    </svg>
  </div>
</template>
<style scoped>
.ws-schematic-scroll {
  overflow-x: auto;
}
.coil-piping-schematic {
  min-width: 660px;
}
</style>
