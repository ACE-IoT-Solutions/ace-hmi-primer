<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import { buildingCondition } from "../lib/building-hierarchy";
import { useTemperatureUnits } from "../lib/units";
import ProcessIntegrity from "./ProcessIntegrity.vue";
import TemperatureTrend from "./TemperatureTrend.vue";
const props = defineProps<{ snapshot: LabSnapshot; target: number }>();
const emit = defineEmits<{ detail: [] }>();
const units = useTemperatureUnits();
const condition = computed(() =>
  buildingCondition(props.snapshot, props.target),
);
</script>
<template>
  <div class="building-operation">
    <ProcessIntegrity :snapshot="snapshot" />
    <div class="screen-status" role="status">
      <strong>{{ condition }}</strong
      ><span>West building · AHU-01 · Floors 1–2</span>
    </div>
    <div class="service-values">
      <div>
        <span>{{
          snapshot.stale ? "Retained supply temperature" : "Supply temperature"
        }}</span
        ><strong>{{ units.temperature(snapshot.actual) }}</strong>
      </div>
      <div>
        <span>Accepted target</span
        ><strong>{{ units.temperature(target) }}</strong>
      </div>
      <div>
        <span>Fan command / proof</span
        ><strong
          >{{ snapshot.fanCommand ? "ON" : "OFF" }} /
          {{ snapshot.fanProof ? "ON" : "OFF" }}</strong
        >
      </div>
      <div>
        <span>Valve command / position</span
        ><strong
          >{{ snapshot.valveCommand }}% /
          {{ snapshot.valvePosition ?? "Unknown"
          }}{{ snapshot.valvePosition === null ? "" : "%" }}</strong
        ><small>Feedback {{ snapshot.points.valvePosition.quality }}</small>
      </div>
    </div>
    <div class="service-path" aria-label="Operating service relationships">
      <section>
        <h4>Utility input</h4>
        <p>
          Entering coil water
          {{
            snapshot.enteringWater === null
              ? "unknown"
              : units.temperature(snapshot.enteringWater)
          }}
          · {{ snapshot.points.enteringWater.quality }}
        </p>
        <p>Check upstream chilled-water availability when supply is warm.</p>
      </section>
      <section>
        <h4>Air service</h4>
        <p>
          AHU-01 supplies Floors 1–2. Follow command, proof, temperature and
          recent direction together.
        </p>
      </section>
      <section>
        <h4>Consumers</h4>
        <p>
          Zone 101 comfort alarm:
          {{
            snapshot.alarms.some((a) => a.id === "zone-warm")
              ? "active"
              : "not reported in this case"
          }}.
        </p>
        <p>
          Individual zone measurements are not modeled; supply temperature does
          not establish every room’s condition.
        </p>
      </section>
    </div>
    <TemperatureTrend :snapshot="snapshot" :target="target" />
    <button class="primary" @click="emit('detail')">
      Investigate AHU-01 cooling subsystem
    </button>
    <p class="source">
      Important abnormalities and lost data remain visible here. The next level
      adds evidence; it does not hide the first indication of a problem.
    </p>
  </div>
</template>
<style scoped>
.service-values {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}
.service-values > div {
  background: #e4e8eb;
  padding: 1rem;
}
.service-values span,
.service-values small {
  display: block;
  font-size: 0.8rem;
}
.service-values strong {
  display: block;
  font-size: 1.35rem;
}
.service-path {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}
.service-path section {
  padding: 1rem;
  border: 1px solid #9ba7b2;
}
.service-path h4 {
  margin: 0 0 0.5rem;
}
.service-path p {
  font-size: 0.9rem;
  margin-bottom: 0;
}
.screen-status {
  margin: 1rem 0;
}
@media (max-width: 720px) {
  .service-values {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .service-path {
    grid-template-columns: 1fr;
  }
}
</style>
