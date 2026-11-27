<script setup lang="ts">
import { computed, ref } from "vue";
import type { LabSnapshot } from "../lib/lab";
import { pointDiagnostic, type BuildingPoint } from "../lib/building-hierarchy";
import { useTemperatureUnits } from "../lib/units";
const props = defineProps<{ snapshot: LabSnapshot }>();
const point = defineModel<BuildingPoint>("point", { required: true });
const emit = defineEmits<{ close: [] }>();
const tab = ref("point");
const units = useTemperatureUnits();
const diagnostic = computed(() => pointDiagnostic(props.snapshot, point.value));
const value = (n: number) =>
  point.value === "valvePosition" ? `${n}%` : units.temperature(n);
const marker = computed(() =>
  diagnostic.value.value === null
    ? 0
    : Math.max(
        0,
        Math.min(
          100,
          ((diagnostic.value.value - diagnostic.value.range[0]!) /
            (diagnostic.value.range[1]! - diagnostic.value.range[0]!)) *
            100,
        ),
      ),
);
</script>
<template>
  <section
    class="building-point ws-point-inspector"
    role="dialog"
    aria-label="AHU-01 point diagnostics"
  >
    <header class="ws-point-title">
      <strong>{{ diagnostic.binding }} / Point details</strong
      ><button aria-label="Close point inspector" @click="emit('close')">
        ×
      </button>
    </header>
    <div class="ws-point-selector">
      <label
        >Diagnostic point<select v-model="point">
          <option value="valvePosition">Valve position feedback</option>
          <option value="supplyTemperature">Supply temperature</option>
          <option value="enteringWater">Entering water temperature</option>
          <option value="leavingWater">Leaving water temperature</option>
        </select></label
      >
    </div>
    <div class="point-faceplate">
      <div>
        <span>{{ diagnostic.name }}</span
        ><strong class="point-value">{{
          diagnostic.value === null ? "Unavailable" : value(diagnostic.value)
        }}</strong
        ><small role="status">{{
          diagnostic.current
            ? "GOOD / CURRENT"
            : "Retained / unverified · current value unknown"
        }}</small>
      </div>
      <span
        class="ws-point-quality"
        :class="{ 'ws-bad-text': !diagnostic.current }"
        >{{ diagnostic.quality.toUpperCase()
        }}<small>{{ diagnostic.ageSeconds }} s ago</small></span
      >
    </div>
    <div class="ws-point-range">
      <div>
        <i v-if="diagnostic.value !== null" :style="{ left: `${marker}%` }" />
      </div>
      <span>{{ value(diagnostic.range[0]!) }}</span
      ><span>{{ value(diagnostic.range[1]!) }}</span>
    </div>
    <div
      class="ws-point-tabs"
      role="group"
      aria-label="Point inspector sections"
    >
      <button :aria-pressed="tab === 'point'" @click="tab = 'point'">
        Point</button
      ><button :aria-pressed="tab === 'interlocks'" @click="tab = 'interlocks'">
        Interlocks</button
      ><button :aria-pressed="tab === 'procedure'" @click="tab = 'procedure'">
        Procedure
      </button>
    </div>
    <dl v-if="tab === 'point'" class="point-metadata ws-keyvalue ws-pad">
      <div>
        <dt>Object</dt>
        <dd>{{ diagnostic.binding }}</dd>
      </div>
      <div>
        <dt>Quality</dt>
        <dd>{{ diagnostic.quality.toUpperCase() }}</dd>
      </div>
      <div>
        <dt>Sample age</dt>
        <dd>{{ diagnostic.ageSeconds }} s</dd>
      </div>
      <div>
        <dt>Signal source</dt>
        <dd>{{ diagnostic.source }}</dd>
      </div>
      <div>
        <dt>Engineering range</dt>
        <dd>
          {{ value(diagnostic.range[0]!) }} to {{ value(diagnostic.range[1]!) }}
        </dd>
      </div>
      <div>
        <dt>Controller</dt>
        <dd>West / AHU-01</dd>
      </div>
    </dl>
    <section v-else-if="tab === 'interlocks'" class="point-procedures ws-pad">
      <div class="ws-panel-heading">
        <strong>Interlocks and permissives</strong><span>AHU-01</span>
      </div>
      <dl class="ws-keyvalue">
        <div>
          <dt>Fan start permissive</dt>
          <dd>
            {{
              snapshot.commState === "disconnected" ? "UNKNOWN" : "SATISFIED"
            }}
          </dd>
        </div>
        <div>
          <dt>Freeze safety shutdown</dt>
          <dd>
            {{ snapshot.commState === "disconnected" ? "UNKNOWN" : "INACTIVE" }}
          </dd>
        </div>
        <div>
          <dt>Communication</dt>
          <dd>
            {{
              snapshot.commState === "disconnected"
                ? "unknown · display disconnected"
                : "CONNECTED"
            }}
          </dd>
        </div>
      </dl>
    </section>
    <section v-else class="point-procedures ws-pad">
      <strong>AHU-01 / Cooling response checks</strong>
      <ol>
        <li>Verify signal identity, quality and sample age.</li>
        <li>
          Compare effective command, override, travel time and independent
          feedback.
        </li>
        <li>Verify actuator, linkage and physical valve travel.</li>
        <li>
          Check entering/leaving water and hydronic availability. Verify flow
          and isolation independently.
        </li>
      </ol>
      <p>Training reference · confirm against the approved site procedure.</p>
    </section>
    <footer class="ws-point-footer">READ ONLY · snapshot diagnostics</footer>
  </section>
</template>
<style scoped>
.ws-point-inspector {
  background: #f7f9fa;
  border: 1px solid #7a8e9a;
  box-shadow: 0 10px 32px #344d5c45;
  width: min(490px, 100%);
  min-width: 0;
}
.ws-point-title {
  background: #d3dde3;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 12px;
}
.ws-point-selector {
  padding: 0.75rem;
  font-size: 11px;
}
select {
  width: 100%;
  margin-top: 0.3rem;
}
.point-faceplate {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 1rem;
}
.point-faceplate > div > span {
  font-size: 11px;
  color: #5d6c75;
}
.point-value {
  display: block;
  font-size: 36px;
  line-height: 1.4;
}
.point-faceplate small {
  display: block;
  font-size: 10px;
}
.ws-point-quality {
  font-weight: 700;
  padding-top: 0.4rem;
  text-align: right;
}
.ws-point-range {
  padding: 0.5rem 1rem 1rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 10px;
}
.ws-point-range > div {
  flex-basis: 100%;
  height: 10px;
  border: 1px solid #9eafb9;
  background: #e0e7eb;
  position: relative;
  margin: 0.5rem 0;
}
.ws-point-range i {
  position: absolute;
  width: 3px;
  height: 18px;
  top: -5px;
  background: #3e6a84;
}
.ws-point-tabs {
  display: flex;
  gap: 0.3rem;
  padding: 0 0.75rem;
  border-bottom: 1px solid #a9b6bf;
}
.ws-point-tabs [aria-pressed="true"] {
  background: #dce7ed;
  border-bottom: 3px solid #3e6a84;
}
.point-metadata dd {
  max-width: 65%;
  text-align: right;
  overflow-wrap: anywhere;
}
.point-procedures {
  min-height: 235px;
}
.point-procedures ol {
  padding-left: 1.2rem;
  font-size: 12px;
}
.point-procedures li {
  margin: 0.5rem 0;
}
.ws-point-footer {
  padding: 0.6rem 0.8rem;
  border-top: 1px solid #a9b6bf;
  font-size: 10px;
  color: #5e6d77;
}
</style>
