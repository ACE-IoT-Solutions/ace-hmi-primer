<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import { pointDiagnostic, type BuildingPoint } from "../lib/building-hierarchy";
import { useTemperatureUnits } from "../lib/units";
const props = defineProps<{ snapshot: LabSnapshot }>();
const point = defineModel<BuildingPoint>("point", { required: true });
const units = useTemperatureUnits();
const diagnostic = computed(() => pointDiagnostic(props.snapshot, point.value));
const value = (n: number) =>
  point.value === "valvePosition" ? `${n}%` : units.temperature(n);
</script>
<template>
  <section class="building-point" aria-label="Focused point diagnostics">
    <label class="field"
      >Diagnostic point<select v-model="point">
        <option value="valvePosition">Valve position feedback</option>
        <option value="supplyTemperature">Supply temperature</option>
        <option value="enteringWater">Entering water temperature</option>
        <option value="leavingWater">Leaving water temperature</option>
      </select></label
    >
    <div class="point-faceplate">
      <div>
        <span class="eyebrow">AHU-01 / POINT FACEPLATE</span>
        <h4>{{ diagnostic.binding }}</h4>
        <strong class="point-value">{{
          diagnostic.value === null ? "Unavailable" : value(diagnostic.value)
        }}</strong>
        <p role="status">
          {{
            diagnostic.current
              ? "Current example observation"
              : "Retained / unverified · current value unknown"
          }}
        </p>
      </div>
      <dl class="point-metadata">
        <div>
          <dt>Quality</dt>
          <dd>{{ diagnostic.quality.toUpperCase() }}</dd>
        </div>
        <div>
          <dt>Sample age at snapshot</dt>
          <dd>{{ diagnostic.ageSeconds }} s</dd>
        </div>
        <div>
          <dt>Observation source</dt>
          <dd>{{ diagnostic.source }}</dd>
        </div>
        <div>
          <dt>Illustrative engineering range</dt>
          <dd>
            {{ value(diagnostic.range[0]!) }} to
            {{ value(diagnostic.range[1]!) }}
          </dd>
        </div>
        <div>
          <dt>Teaching binding</dt>
          <dd>
            West / AHU controller / {{ diagnostic.binding }} · illustrative
            identifiers, not a live device address
          </dd>
        </div>
      </dl>
    </div>
    <div class="point-procedures">
      <section>
        <h4>Equipment operating procedure / diagnostic help</h4>
        <ol>
          <li>
            Verify point identity, quality and sample age before treating the
            value as current.
          </li>
          <li>
            Compare effective command, override source, travel allowance and
            independent feedback. An accepted write is not proof of movement.
          </li>
          <li>
            Check actuator/linkage and physical valve travel against the
            installed feedback mechanism.
          </li>
          <li>
            Compare entering/leaving water temperatures; verify flow, isolation
            and hydronic availability using installed measurements or a field
            check.
          </li>
        </ol>
        <p>
          Keep calibration history, sensor configuration and the approved
          equipment procedure available from this context. This exercise
          supplies diagnostic prompts, not a site operating procedure.
        </p>
      </section>
      <section>
        <h4>Interlocks and permissives</h4>
        <p>
          Fan start permissive:
          {{
            snapshot.commState === "disconnected"
              ? "unknown · display disconnected"
              : "satisfied in this fixed example"
          }}.
        </p>
        <p>
          Freeze interlock:
          {{
            snapshot.commState === "disconnected"
              ? "unknown · display disconnected"
              : "inactive in this fixed example"
          }}.
        </p>
        <p>
          Freeze safety shutdown, related permissives and their diagnostic
          evidence belong in this focused context. Any active protection or
          unavailable signal must also be apparent on the operating display.
        </p>
      </section>
    </div>
    <p class="source">
      This faceplate is an example of Level 4 content. Its bindings, engineering
      ranges and interlock states are illustrative; no calibration or protection
      bypass is performed here.
    </p>
  </section>
</template>
<style scoped>
.point-faceplate {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 1.5rem;
  border: 1px solid #9ba7b2;
  padding: 1.2rem;
  background: #fafbfc;
}
.point-faceplate .eyebrow {
  color: #365164;
}
.point-faceplate h4 {
  overflow-wrap: anywhere;
}
.point-value {
  font-size: 2.5rem;
}
.point-metadata {
  margin: 0;
  display: grid;
  gap: 0.7rem;
}
.point-metadata div {
  border-bottom: 1px solid #ccd1d6;
  padding-bottom: 0.5rem;
}
.point-metadata dt {
  font-size: 0.8rem;
}
.point-metadata dd {
  margin: 0;
  font-weight: 650;
}
.point-procedures {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.point-procedures h4 {
  font-size: 1.1rem;
}
.point-procedures p,
li {
  font-size: 0.9rem;
}
li {
  margin-bottom: 0.5rem;
}
@media (max-width: 720px) {
  .point-faceplate,
  .point-procedures {
    grid-template-columns: 1fr;
  }
}
</style>
