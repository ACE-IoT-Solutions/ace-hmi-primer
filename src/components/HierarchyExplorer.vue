<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import type { LabSnapshot, Scenario, WriteState } from "../lib/lab";
import {
  buildingCases,
  hierarchyLevels,
  pointDiagnostic,
  type BuildingPoint,
} from "../lib/building-hierarchy";
import BuildingOverview from "./BuildingOverview.vue";
import BuildingOperation from "./BuildingOperation.vue";
import BuildingPointDiagnostics from "./BuildingPointDiagnostics.vue";
import OperatorWorkstation from "./OperatorWorkstation.vue";
import BuildingEquipmentDetail from "./BuildingEquipmentDetail.vue";
import WorkstationTargetControl from "./WorkstationTargetControl.vue";
const props = defineProps<{ snapshot: LabSnapshot }>();
const scenario = defineModel<Scenario>("scenario", { required: true });
const target = defineModel<number>("target", { required: true });
const emit = defineEmits<{
  state: [value: WriteState];
  valveAccepted: [value: number];
  acknowledge: [id: string];
}>();
const level = ref(1),
  assignment = ref("campus"),
  point = ref<BuildingPoint>("valvePosition");
const title = ref<HTMLElement | null>(null);
const visitedOperation = ref(false);
const controlsOpen = ref(false);
const current = computed(() => hierarchyLevels[level.value - 1]!);
const paths = computed(() => [
  assignment.value === "campus"
    ? "Campus responsibility"
    : "West building responsibility",
  "West air service",
  "AHU-01 cooling subsystem",
  `Point: ${pointDiagnostic(props.snapshot, point.value).name}`,
]);
async function navigate(value: number, selectedPoint?: BuildingPoint) {
  if (selectedPoint) point.value = selectedPoint;
  level.value = value;
  if (value === 2) visitedOperation.value = true;
  else controlsOpen.value = false;
  await nextTick();
  title.value?.focus({ preventScroll: true });
}
</script>
<template>
  <section class="panel hierarchy building-hierarchy">
    <div class="section-top">
      <div>
        <span class="eyebrow">BUILDING WORKSHOP / FOUR DISPLAY LEVELS</span>
        <h2>Four levels on an operator’s workstation.</h2>
      </div>
      <span class="tag">§ 6.3.1–6.3.4</span>
    </div>
    <p>
      Choose a building case, then follow the same service through four original
      workstation graphics.
    </p>
    <div class="hierarchy-controls">
      <label class="field"
        >Operator responsibility<select
          v-model="assignment"
          @change="navigate(1)"
        >
          <option value="campus">Campus facilities operator</option>
          <option value="building">West building operator</option>
        </select></label
      >
      <label class="field"
        >Building case<select v-model="scenario">
          <option v-for="[id, label] in buildingCases" :key="id" :value="id">
            {{ label }}
          </option>
        </select></label
      >
    </div>
    <div class="level-buttons" role="group" aria-label="Explore display levels">
      <button
        v-for="(item, i) in hierarchyLevels"
        :key="item.name"
        :aria-label="`LEVEL ${i + 1} ${item.name}`"
        :aria-pressed="level === i + 1"
        @click="navigate(i + 1)"
      >
        <small>LEVEL {{ i + 1 }}</small
        >{{ item.name }}
      </button>
    </div>
    <nav
      class="hierarchy-breadcrumb"
      aria-label="Current building display path"
    >
      <template v-for="(path, i) in paths.slice(0, level)" :key="i"
        ><span v-if="i" aria-hidden="true">›</span
        ><button
          :aria-current="i === level - 1 ? 'page' : undefined"
          @click="navigate(i + 1)"
        >
          {{ path }}
        </button></template
      >
    </nav>
    <div class="hierarchy-detail building-level">
      <header>
        <span class="eyebrow">LEVEL {{ level }} · {{ current.scope }}</span>
        <h3 ref="title" tabindex="-1">{{ current.task }}</h3>

        <p
          v-if="snapshot.writeState.phase !== 'idle'"
          class="hierarchy-write-state"
          role="status"
        >
          Latest simulated write: {{ snapshot.writeState.phase }} ·
          {{ snapshot.writeState.message }}
        </p>
      </header>
      <OperatorWorkstation
        :snapshot="snapshot"
        :target="target"
        :level="level"
        :assignment="assignment"
        @navigate="navigate($event)"
        @acknowledge="emit('acknowledge', $event)"
      >
        <BuildingOverview
          v-if="level === 1"
          :snapshot="snapshot"
          :target="target"
          :assignment="assignment"
          @investigate="navigate(2)"
        />
        <BuildingOperation
          v-else-if="level === 2"
          :snapshot="snapshot"
          :target="target"
          @detail="navigate(3)"
          @inspect="navigate(4, $event)"
          @control="controlsOpen = true"
        />
        <BuildingEquipmentDetail
          v-else-if="level === 3"
          :snapshot="snapshot"
          @inspect="navigate(4, $event)"
        />
        <div v-else class="ws-diagnostic-stage">
          <div class="ws-diagnostic-background" aria-hidden="true" inert>
            <BuildingEquipmentDetail :snapshot="snapshot" background />
          </div>
          <BuildingPointDiagnostics
            v-model:point="point"
            :snapshot="snapshot"
            @close="navigate(3)"
          />
        </div>
        <div
          v-if="visitedOperation"
          v-show="level === 2 && controlsOpen"
          class="ws-control-host"
        >
          <WorkstationTargetControl
            :key="scenario"
            v-model:target="target"
            :snapshot="snapshot"
            @state="emit('state', $event)"
            @close="controlsOpen = false"
          />
        </div>
      </OperatorWorkstation>
    </div>
    <div class="hierarchy-coaching">
      <strong>{{ current.task }} · Level {{ level }}</strong>
      <p>{{ current.purpose }}</p>
      <p>
        Select “Valve command / position mismatch.” At Level 1 locate the
        affected service; at Level 2 compare its target, response and
        dependencies; at Level 3 separate valve travel from warm water; at Level
        4 check whether the position signal can be trusted. Repeat with stale
        feedback or a shared chiller trip. The case and accepted target remain
        the same as you navigate.
      </p>
    </div>
    <details class="building-mappings">
      <summary>Apply the four jobs to other building systems</summary>
      <div class="mapping-scroll">
        <table>
          <caption>
            Illustrative mappings · choose scopes to fit actual operator
            responsibilities
          </caption>
          <thead>
            <tr>
              <th>Assignment</th>
              <th>L1 · Awareness</th>
              <th>L2 · Routine operation</th>
              <th>L3 · Diagnosis / detail</th>
              <th>L4 · Focused diagnostics</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Single office building</th>
              <td>Assigned building services and key deviations</td>
              <td>Air service / AHU operating display</td>
              <td>Cooling coil, valve and water-side detail</td>
              <td>Position feedback point and equipment procedure</td>
            </tr>
            <tr>
              <th>Campus utilities</th>
              <td>Plant availability and affected buildings</td>
              <td>Chilled-water plant operating display</td>
              <td>Chiller/pump sequence and subsystem detail</td>
              <td>Pump run proof, permissives and diagnostic help</td>
            </tr>
            <tr>
              <th>School facilities</th>
              <td>Key conditions across assigned schools</td>
              <td>School heating-loop operating display</td>
              <td>Boiler/mixing-loop detail</td>
              <td>Sensor quality, freeze interlocks and procedures</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
    <p class="source">
      Graphics, point bindings, engineering ranges, reference-service values and
      interlock states are original fixed teaching examples. A campus operator
      and a single-building operator can both use all four levels; these are
      display jobs, not a campus/building/floor/equipment folder tree. §
      6.3–6.3.4; 7.2.2 · Standard guidance. These original building mappings are
      ACE teaching examples. Four display levels are a recommended maximum, not
      four required screens or clicks. An AHU can appear at several levels with
      different jobs; direct and relational links can bypass intermediate
      displays.
    </p>
  </section>
</template>
<style scoped>
.hierarchy-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.building-hierarchy .level-buttons {
  max-width: none;
  margin: 0.8rem 0;
}
.building-hierarchy .level-buttons button {
  padding: 0.55rem 0.8rem;
}
.building-hierarchy .level-buttons small {
  display: inline;
  margin-right: 0.5rem;
}
.hierarchy-controls .field {
  margin: 0;
}

.hierarchy-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.hierarchy-breadcrumb button {
  font-size: 0.8rem;
  padding: 0.45rem 0.65rem;
}
.hierarchy-breadcrumb [aria-current] {
  border-color: var(--ace-primary);
}
.building-level {
  display: block;
}
.building-level > header {
  margin-bottom: 1rem;
}
.building-level > header h3 {
  font-size: 1.6rem;
}
.ws-control-host {
  position: absolute;
  top: 135px;
  right: 1rem;
  z-index: 4;
  width: min(400px, calc(100% - 2rem));
}
.ws-diagnostic-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: 650px;
}
.ws-diagnostic-background {
  grid-area: 1 / 1;
  opacity: 0.55;
  pointer-events: none;
}
.ws-diagnostic-stage > .building-point {
  grid-area: 1 / 1;
  z-index: 1;
  align-self: start;
  justify-self: end;
  margin: 0.5rem;
}
.hierarchy-coaching {
  margin: 1.5rem 0;
  padding: 1rem;
  border-left: 3px solid var(--ace-primary);
  background: var(--ace-bg-elevated);
}
.hierarchy-coaching p {
  margin-bottom: 0;
}
.mapping-scroll {
  overflow-x: auto;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 1rem;
  font-size: 0.85rem;
}
caption {
  text-align: left;
  margin-bottom: 0.5rem;
  color: var(--ace-text-muted);
}
th,
td {
  text-align: left;
  vertical-align: top;
  padding: 0.75rem;
  border: 1px solid var(--ace-border-strong);
}
@media (max-width: 720px) {
  .hierarchy-controls {
    grid-template-columns: 1fr;
  }
  .ws-diagnostic-background {
    display: none;
  }
  .ws-diagnostic-stage {
    min-height: 0;
  }
  .ws-diagnostic-stage > .building-point {
    margin: 0;
  }

  .level-buttons {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
