<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import { buildingCondition } from "../lib/building-hierarchy";
import { useTemperatureUnits } from "../lib/units";
import CampusOverviewGraphic from "./CampusOverviewGraphic.vue";
import TemperatureTrend from "./TemperatureTrend.vue";
const props = defineProps<{
  snapshot: LabSnapshot;
  target: number;
  assignment: string;
}>();
const emit = defineEmits<{ investigate: [] }>();
const units = useTemperatureUnits();
const condition = computed(() =>
  buildingCondition(props.snapshot, props.target),
);
const lost = computed(() => props.snapshot.commState === "disconnected");
</script>
<template>
  <div class="building-overview">
    <div class="ws-metrics">
      <div class="ws-metric">
        <span>RESPONSIBILITY</span
        ><strong>{{
          assignment === "campus" ? "North campus" : "West building"
        }}</strong
        ><small class="hierarchy-scope">{{
          assignment === "campus"
            ? "Campus facilities operator"
            : "West building operator"
        }}</small>
      </div>
      <div
        class="ws-metric"
        :class="{ attention: condition !== 'Within operating band' }"
      >
        <span>WEST SUPPLY / TARGET</span
        ><strong>{{ units.temperature(snapshot.actual) }}</strong
        ><small
          >target {{ units.temperature(target)
          }}{{ snapshot.stale ? " · RETAINED" : "" }}</small
        >
      </div>
      <div class="ws-metric">
        <span>SUPPLY DEVIATION</span
        ><strong>{{
          snapshot.stale || lost
            ? "UNKNOWN"
            : `${snapshot.actual >= target ? "+" : ""}${units.delta(snapshot.actual - target)}`
        }}</strong
        ><small
          >{{
            snapshot.trend.at(-1)! > snapshot.trend[0]!
              ? "Recent direction ↑ rising"
              : "Recent direction ↓ falling"
          }}{{ snapshot.stale ? " · historical" : "" }}</small
        >
      </div>
      <div class="ws-metric">
        <span>CONFIGURED ALARMS</span
        ><strong>{{
          lost
            ? "UNVERIFIED"
            : snapshot.alarms.filter((a) => a.kind === "alarm").length
        }}</strong
        ><small
          >{{
            snapshot.alarms.filter((a) => a.kind === "alert").length
          }}
          maintenance alerts</small
        >
      </div>
    </div>
    <div class="ws-grid">
      <section class="ws-panel">
        <div class="ws-panel-heading">
          <strong>Building services</strong
          ><span>West branch selected · select AHU-01 to operate</span>
        </div>
        <div
          class="ws-map-scroll"
          tabindex="0"
          role="region"
          aria-label="Building service plan, scroll horizontally for full plan"
        >
          <CampusOverviewGraphic
            :snapshot="snapshot"
            :target="target"
            :assignment="assignment"
            @investigate="emit('investigate')"
          />
        </div>
      </section>
      <aside class="ws-side">
        <section class="ws-panel">
          <div class="ws-panel-heading">
            <strong>West AHU-01 / SAT</strong><span>30 min</span>
          </div>
          <TemperatureTrend :snapshot="snapshot" :target="target" />
        </section>
        <section class="ws-panel">
          <div class="ws-panel-heading">
            <strong>Priority conditions</strong><span>West air service</span>
          </div>
          <div class="ws-pad">
            <strong>{{ condition }}</strong>
            <p
              v-for="alarm in snapshot.alarms.filter(
                (a) => a.kind === 'alarm' && a.priority === 'high',
              )"
              :key="alarm.id"
              class="overview-alarm ws-bad-text"
            >
              HIGH · {{ alarm.equipment }} · {{ alarm.message }} ·
              {{ alarm.acknowledged ? "Acknowledged" : "Unacknowledged" }}
            </p>
            <p v-if="lost">Current service unknown · last contact 720 s ago</p>
            <p v-else>AHU-01 · West Floors 1–2</p>
          </div>
        </section>
      </aside>
    </div>
    <section class="ws-panel ws-overview-register">
      <div class="ws-panel-heading">
        <strong>Service register</strong
        ><span>Selected service and reference service</span>
      </div>
      <div class="ws-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Measured SAT</th>
              <th>Target</th>
              <th>Condition / quality</th>
              <th>Display</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>West / AHU-01</td>
              <td>{{ units.temperature(snapshot.actual) }}</td>
              <td>{{ units.temperature(target) }}</td>
              <td>{{ condition }}</td>
              <td>
                <button
                  aria-label="Open West air service from register"
                  @click="emit('investigate')"
                >
                  Open operating display ↗
                </button>
              </td>
            </tr>
            <tr>
              <td>{{ assignment === "campus" ? "East" : "West" }} / AHU-02</td>
              <td>{{ units.temperature(16.3) }}</td>
              <td>{{ units.temperature(16) }}</td>
              <td>
                {{
                  lost
                    ? "Current service unknown"
                    : "Within band · reference snapshot"
                }}
              </td>
              <td>Reference only</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <div
      class="building-dependency ws-service-strip"
      aria-label="Building service dependency"
    >
      <span>Central plant / chilled water</span><span>→</span
      ><span>AHU-01 / supply air</span><span>→</span
      ><span>West Floors 1–2</span>
    </div>
  </div>
</template>
<style scoped>
.ws-map-scroll {
  overflow-x: auto;
}
.ws-map-scroll :deep(svg) {
  min-width: 630px;
}
.ws-overview-register {
  margin-top: 0.9rem;
}
.ws-service-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  color: #526773;
  font-size: 11px;
  margin-top: 0.8rem;
}
</style>
