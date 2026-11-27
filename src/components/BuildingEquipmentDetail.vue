<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import type { BuildingPoint } from "../lib/building-hierarchy";
import {
  valveDiagnostic,
  valveTolerance,
  valveTravelAllowance,
  waterDiagnostic,
} from "../lib/coil-diagnostics";
import { useTemperatureUnits } from "../lib/units";
import CoilPipingSchematic from "./CoilPipingSchematic.vue";
const props = defineProps<{ snapshot: LabSnapshot; background?: boolean }>();
const emit = defineEmits<{ inspect: [point: BuildingPoint] }>();
const units = useTemperatureUnits();
const valve = computed(() => valveDiagnostic(props.snapshot));
const water = computed(() => waterDiagnostic(props.snapshot));
</script>
<template>
  <div class="building-equipment-detail">
    <div class="ws-grid">
      <section class="ws-panel">
        <div class="ws-panel-heading">
          <strong>AHU-01 / Coil piping and instrumentation</strong
          ><span>CC-01 / CLV-01 / EWT-01 / LWT-01</span>
        </div>
        <CoilPipingSchematic
          :snapshot="snapshot"
          :interactive="!background"
          @inspect="emit('inspect', $event)"
        />
      </section>
      <aside class="ws-side">
        <section class="ws-panel">
          <div class="ws-panel-heading">
            <strong>CLV-01 tracking</strong
            ><span>{{
              snapshot.points.valvePosition.quality.toUpperCase()
            }}</span>
          </div>
          <div class="ws-pad">
            <strong :class="{ 'ws-bad-text': valve.mismatch }">{{
              valve.label
            }}</strong>
            <div class="travel-tracks">
              <div>
                <span>COMMAND</span>
                <div><i :style="{ width: `${snapshot.valveCommand}%` }" /></div>
                <b>{{ snapshot.valveCommand }}%</b>
              </div>
              <div>
                <span>FEEDBACK</span>
                <div>
                  <i
                    :class="{ 'ws-position-bad': valve.mismatch }"
                    :style="{ width: `${snapshot.valvePosition ?? 0}%` }"
                  />
                </div>
                <b>{{ snapshot.valvePosition ?? "—" }}%</b>
              </div>
            </div>
            <dl class="ws-keyvalue">
              <div>
                <dt>Demand / effective</dt>
                <dd>
                  {{ snapshot.controlDemand }}% / {{ snapshot.valveCommand }}%
                </dd>
              </div>
              <div>
                <dt>Time since command</dt>
                <dd>{{ snapshot.valveCommandAgeSeconds }} s</dd>
              </div>
              <div>
                <dt>Travel allowance</dt>
                <dd>{{ valveTravelAllowance }} s</dd>
              </div>
              <div>
                <dt>Tracking tolerance</dt>
                <dd>±{{ valveTolerance }} percentage points</dd>
              </div>
              <div>
                <dt>Override</dt>
                <dd>
                  {{
                    snapshot.points.coolingValve.override
                      ? `Priority ${snapshot.points.coolingValve.override.priority}`
                      : "None"
                  }}
                </dd>
              </div>
            </dl>
          </div>
        </section>
        <section class="ws-panel">
          <div class="ws-panel-heading">
            <strong>Coil response</strong><span>Independent measurements</span>
          </div>
          <dl class="ws-keyvalue ws-pad">
            <div>
              <dt>Entering water</dt>
              <dd>
                {{
                  snapshot.enteringWater === null
                    ? "—"
                    : units.temperature(snapshot.enteringWater)
                }}
              </dd>
            </div>
            <div>
              <dt>Leaving water</dt>
              <dd>
                {{
                  snapshot.leavingWater === null
                    ? "—"
                    : units.temperature(snapshot.leavingWater)
                }}
              </dd>
            </div>
            <div>
              <dt>Water ΔT</dt>
              <dd>
                {{
                  water.delta === null ? "UNVERIFIED" : units.delta(water.delta)
                }}
              </dd>
            </div>
            <div>
              <dt>Measured water flow</dt>
              <dd>Not instrumented</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
    <section v-if="!background" class="ws-panel equipment-evidence">
      <div class="ws-panel-heading">
        <strong>Point register / select to inspect</strong><span>AHU-01</span>
      </div>
      <div class="ws-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Object</th>
              <th>Description</th>
              <th>Value</th>
              <th>Quality</th>
              <th>Sample age</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="point in [
                {
                  key: 'valvePosition',
                  tag: 'CLV.POS',
                  name: 'Valve position',
                  value: snapshot.valvePosition,
                  age: snapshot.points.valvePosition.ageSeconds,
                },
                {
                  key: 'enteringWater',
                  tag: 'CHW.EWT',
                  name: 'Entering water',
                  value: snapshot.enteringWater,
                  age: snapshot.points.enteringWater.ageSeconds,
                },
                {
                  key: 'leavingWater',
                  tag: 'CHW.LWT',
                  name: 'Leaving water',
                  value: snapshot.leavingWater,
                  age: snapshot.points.leavingWater.ageSeconds,
                },
              ] as const"
              :key="point.key"
            >
              <td>
                <button
                  :aria-label="`Inspect ${point.name.toLowerCase()} point from register`"
                  @click="emit('inspect', point.key)"
                >
                  AHU01.{{ point.tag }} ↗
                </button>
              </td>
              <td>{{ point.name }}</td>
              <td>
                {{
                  point.value === null
                    ? "—"
                    : point.key === "valvePosition"
                      ? `${point.value}%`
                      : units.temperature(point.value)
                }}
              </td>
              <td>{{ snapshot.points[point.key].quality.toUpperCase() }}</td>
              <td>{{ point.age }} s</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
<style scoped>
.equipment-evidence {
  margin-top: 0.9rem;
}
.travel-tracks {
  display: grid;
  gap: 0.6rem;
  margin: 1rem 0;
}
.travel-tracks > div {
  display: grid;
  grid-template-columns: 65px 1fr 40px;
  gap: 0.5rem;
  align-items: center;
  font-size: 10px;
}
.travel-tracks > div > div {
  height: 12px;
  background: #dfe6ea;
  border: 1px solid #9aadb9;
}
.travel-tracks i {
  display: block;
  height: 100%;
  background: #657e8d;
}
.travel-tracks i.ws-position-bad {
  background: #a76c27;
}
.travel-tracks b {
  text-align: right;
  font-size: 12px;
}
</style>
