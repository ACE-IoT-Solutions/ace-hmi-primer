<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import type { BuildingPoint } from "../lib/building-hierarchy";
import { useTemperatureUnits } from "../lib/units";
import AirSystemSchematic from "./AirSystemSchematic.vue";
import TemperatureTrend from "./TemperatureTrend.vue";
const props = defineProps<{ snapshot: LabSnapshot; target: number }>();
const emit = defineEmits<{
  detail: [];
  inspect: [point: BuildingPoint];
  control: [];
}>();
const units = useTemperatureUnits();
const override = computed(() => props.snapshot.points.coolingValve.override);
</script>
<template>
  <div class="building-operation">
    <div class="service-values ws-metrics">
      <div class="ws-metric">
        <span>SUPPLY TEMPERATURE</span
        ><strong>{{ units.temperature(snapshot.actual) }}</strong
        ><small>{{
          snapshot.stale ? "STALE / RETAINED" : "SAT-01 · good"
        }}</small>
      </div>
      <div class="ws-metric">
        <span>ACCEPTED TARGET</span
        ><button
          aria-label="Open supply temperature controller"
          class="ws-setpoint-button"
          @click="emit('control')"
        >
          <strong>{{ units.temperature(target) }}</strong> ↗</button
        ><small>SAT control loop</small>
      </div>
      <div class="ws-metric">
        <span>VALVE CMD / POSITION</span
        ><strong
          >{{ snapshot.valveCommand }}% /
          {{ snapshot.valvePosition ?? "—" }}%</strong
        ><small
          >{{
            snapshot.points.valvePosition.quality.toUpperCase()
          }}
          position</small
        >
      </div>
      <div class="ws-metric">
        <span>FAN CMD / RUN PROOF</span
        ><strong
          >{{ snapshot.fanCommand ? "ON" : "OFF" }} /
          {{ snapshot.fanProof ? "ON" : "OFF" }}</strong
        ><small>{{
          snapshot.commState === "disconnected" ? "RETAINED" : "SF-01 status"
        }}</small>
      </div>
    </div>
    <div class="ws-grid">
      <section class="ws-panel">
        <div class="ws-panel-heading">
          <strong>AHU-01 / Air handling</strong
          ><span>Select coil for detail · select SAT for point inspector</span>
        </div>
        <AirSystemSchematic
          :snapshot="snapshot"
          :target="target"
          @detail="emit('detail')"
          @inspect="emit('inspect', $event)"
        />
      </section>
      <aside class="ws-side">
        <section class="ws-panel">
          <div class="ws-panel-heading">
            <strong>SAT response</strong><span>30 min</span>
          </div>
          <TemperatureTrend :snapshot="snapshot" :target="target" />
        </section>
        <section class="ws-panel">
          <div class="ws-panel-heading">
            <strong>Loop / source</strong><span>CLV-01</span>
          </div>
          <dl class="ws-keyvalue ws-pad">
            <div>
              <dt>Automatic demand</dt>
              <dd>{{ snapshot.controlDemand }}%</dd>
            </div>
            <div>
              <dt>Effective command</dt>
              <dd>{{ snapshot.valveCommand }}%</dd>
            </div>
            <div>
              <dt>Override</dt>
              <dd>
                {{
                  override
                    ? `Priority ${override.priority} · ${override.source}`
                    : "None"
                }}
              </dd>
            </div>
            <div>
              <dt>Position quality</dt>
              <dd>{{ snapshot.points.valvePosition.quality.toUpperCase() }}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
    <section class="ws-panel service-path">
      <div class="ws-panel-heading">
        <strong>Service relationships</strong
        ><span>West / air distribution</span>
      </div>
      <div class="ws-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Upstream utility</th>
              <th>Air system</th>
              <th>Served area</th>
              <th>Consumer condition</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                CHW branch ·
                {{
                  snapshot.enteringWater === null
                    ? "—"
                    : units.temperature(snapshot.enteringWater)
                }}
                entering
              </td>
              <td>AHU-01 / SF-01 / CC-01</td>
              <td>Floors 1–2 · Zone 101</td>
              <td>
                {{
                  snapshot.alarms.some((a) => a.id === "zone-warm")
                    ? "Zone 101 comfort alarm ACTIVE"
                    : "Room sensors not included"
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
<style scoped>
.ws-setpoint-button {
  margin: 0.2rem 0;
}
.service-path {
  margin-top: 0.9rem;
}
</style>
