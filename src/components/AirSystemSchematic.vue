<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import type { BuildingPoint } from "../lib/building-hierarchy";
import { valveDiagnostic } from "../lib/coil-diagnostics";
import { useTemperatureUnits } from "../lib/units";
const props = defineProps<{ snapshot: LabSnapshot; target: number }>();
const emit = defineEmits<{ detail: []; inspect: [point: BuildingPoint] }>();
const units = useTemperatureUnits();
const mismatch = computed(() => valveDiagnostic(props.snapshot).mismatch);
</script>
<template>
  <div
    class="ws-schematic-scroll"
    tabindex="0"
    role="region"
    aria-label="AHU air path schematic, scroll horizontally for full diagram"
  >
    <svg
      class="ws-diagram air-system-schematic"
      viewBox="0 0 850 435"
      role="group"
      aria-label="AHU-01 air handling schematic with cooling coil, fan command and proof, water and supply temperature"
    >
      <rect width="850" height="435" fill="#f1f4f5" />
      <text x="25" y="30" class="svg-label">
        AHU-01 / WEST BUILDING / FLOORS 1–2
      </text>
      <text x="25" y="52" class="svg-small">
        Air service · design path shown; airflow not metered
      </text>
      <path
        d="M30 195H810V272H30Z"
        fill="#dce4e8"
        stroke="#7e919d"
        stroke-width="2"
      />
      <path d="M35 233H805" class="svg-line" stroke-dasharray="7 8" />
      <path
        d="M205 233l-12-6v12ZM470 233l-12-6v12ZM785 233l-12-6v12Z"
        fill="#748d9d"
      />
      <text x="28" y="175" class="svg-label">RETURN / MIXED AIR</text>
      <text x="30" y="300">RA {{ units.temperature(23) }}</text>
      <rect
        x="125"
        y="195"
        width="30"
        height="77"
        fill="#e7ecef"
        stroke="#7e919d"
      />
      <path
        d="M128 198l24 13-24 13 24 13-24 13 24 13"
        stroke="#8096a3"
        fill="none"
      />
      <text x="113" y="323" class="svg-small">FILTER</text>
      <g
        class="svg-click"
        role="button"
        tabindex="0"
        aria-label="Investigate AHU-01 cooling subsystem"
        @click="emit('detail')"
        @keydown.enter="emit('detail')"
        @keydown.space.prevent="emit('detail')"
      >
        <rect
          x="303"
          y="183"
          width="65"
          height="101"
          class="svg-box"
          :class="{ 'svg-attention': mismatch }"
        />
        <path
          d="M310 193l48 14-48 14 48 14-48 14 48 14"
          stroke="#6e8797"
          stroke-width="3"
          fill="none"
        />
        <text x="306" y="324" class="svg-label">CC-01 ↗</text>
      </g>
      <path d="M320 183V90H250M350 284V357H250" class="svg-pipe" />
      <circle cx="270" cy="90" r="10" fill="#f8fafb" stroke="#6e8797" />
      <text x="265" y="95" class="svg-small">T</text>
      <circle cx="270" cy="357" r="10" fill="#f8fafb" stroke="#6e8797" />
      <text x="265" y="362" class="svg-small">T</text>
      <text x="34" y="91" class="svg-label">
        CHW ENTERING
        {{
          snapshot.enteringWater === null
            ? "—"
            : units.temperature(snapshot.enteringWater)
        }}
      </text>
      <text x="34" y="359" class="svg-label">
        CHW LEAVING
        {{
          snapshot.leavingWater === null
            ? "—"
            : units.temperature(snapshot.leavingWater)
        }}
      </text>
      <path
        d="M320 127l-12-10v20Zm0 0l12-10v20Z"
        transform="rotate(90 320 127)"
        fill="#d8e1e6"
        stroke="#627f90"
      />
      <path d="M320 127H345V115" class="svg-line" />
      <rect
        x="334"
        y="96"
        width="23"
        height="19"
        fill="#dbe3e7"
        stroke="#627f90"
      />
      <rect
        x="390"
        y="79"
        width="190"
        height="74"
        class="svg-box"
        :class="{ 'svg-attention': mismatch }"
      />
      <text x="403" y="102" class="svg-label">CLV-01</text>
      <text x="403" y="124">
        Cmd {{ snapshot.valveCommand }}% / Pos
        {{ snapshot.valvePosition ?? "—" }}%
      </text>
      <text x="403" y="143" class="svg-small">
        {{ snapshot.points.valvePosition.quality.toUpperCase() }} feedback
      </text>
      <path d="M357 107H390" class="svg-line" />
      <rect
        x="505"
        y="185"
        width="96"
        height="96"
        fill="#edf1f3"
        stroke="#7e919d"
        stroke-width="2"
      />
      <circle
        cx="553"
        cy="233"
        r="35"
        fill="#dce4e8"
        stroke="#748d9d"
        stroke-width="2"
      />
      <path
        d="M553 233l-18-25q36-8 18 25l30-3q-10 35-30 3l-12 27q-26-24 12-27Z"
        fill="#95a7b2"
        stroke="#758e9f"
      />
      <text x="520" y="324" class="svg-label">SF-01</text>
      <rect
        x="474"
        y="350"
        width="186"
        height="61"
        class="svg-box"
        :class="{ 'svg-attention': snapshot.fanCommand !== snapshot.fanProof }"
      />
      <text x="487" y="373" class="svg-label">
        CMD {{ snapshot.fanCommand ? "ON" : "OFF" }} / PROOF
        {{ snapshot.fanProof ? "ON" : "OFF" }}
      </text>
      <text x="487" y="395" class="svg-small">
        {{
          snapshot.commState === "disconnected"
            ? "RETAINED / UNKNOWN"
            : "Independent run status"
        }}
      </text>
      <path d="M553 281V350" class="svg-line" />
      <g
        class="svg-click"
        role="button"
        tabindex="0"
        aria-label="Inspect supply temperature point from air schematic"
        @click="emit('inspect', 'supplyTemperature')"
        @keydown.enter="emit('inspect', 'supplyTemperature')"
        @keydown.space.prevent="emit('inspect', 'supplyTemperature')"
      >
        <path d="M716 195V144" class="svg-line" />
        <circle cx="716" cy="195" r="9" fill="#f8fafb" stroke="#627f90" />
        <rect
          x="635"
          y="76"
          width="191"
          height="75"
          class="svg-box"
          :class="{
            'svg-attention': snapshot.stale || snapshot.actual > target + 2,
          }"
        />
        <text x="648" y="98" class="svg-label">SAT-01 ↗</text>
        <text x="648" y="124" class="svg-value">
          {{ units.temperature(snapshot.actual) }}
        </text>
        <text x="648" y="143" class="svg-small">
          {{
            snapshot.stale
              ? "STALE / RETAINED"
              : `SP ${units.temperature(target)}`
          }}
        </text>
      </g>
      <text x="691" y="300" class="svg-label">SUPPLY TO</text>
      <text x="691" y="322" class="svg-label">FLOORS 1–2 →</text>
    </svg>
  </div>
</template>
<style scoped>
.ws-schematic-scroll {
  overflow-x: auto;
}
.air-system-schematic {
  min-width: 680px;
}
</style>
