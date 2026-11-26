<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref } from "vue";
import { useTemperatureUnits } from "../lib/units";
const units = useTemperatureUnits();
const repairNumbers = ref(false),
  repairWords = ref(false),
  repairActions = ref(false),
  repairPopup = ref(false);
const open = ref(false),
  moved = ref(false),
  remaining = ref(12),
  message = ref("");
const faceplate = ref<HTMLElement>(),
  opener = ref<HTMLButtonElement>();
const reading = computed(() =>
  repairNumbers.value
    ? units.temperature(22.43567)
    : `${units.unit.value === "C" ? "22.43567" : "72.38419"} ${units.label()}`,
);
let countdown: ReturnType<typeof setInterval> | undefined;
function close() {
  open.value = false;
  clearInterval(countdown);
  nextTick(() => opener.value?.focus());
}
function show() {
  open.value = true;
  remaining.value = 12;
  moved.value = false;
  nextTick(() => faceplate.value?.focus());
  clearInterval(countdown);
  countdown = setInterval(() => {
    remaining.value--;
    if (remaining.value <= 0) close();
  }, 1000);
}
onUnmounted(() => clearInterval(countdown));
</script>
<template>
  <section class="panel exercise-panel">
    <span class="eyebrow">S6 · Formatting and entry clinic</span>
    <h2>Repair the faceplate.</h2>
    <div class="clinic-controls">
      <label class="toggle"
        ><input v-model="repairNumbers" type="checkbox" /> Repair numeric
        presentation</label
      ><label class="toggle"
        ><input v-model="repairWords" type="checkbox" /> Use readable task
        language</label
      ><label class="toggle"
        ><input v-model="repairActions" type="checkbox" /> Distinguish
        navigation and process actions</label
      ><label class="toggle"
        ><input v-model="repairPopup" type="checkbox" /> Keep alarm information
        visible around the popup</label
      >
    </div>
    <div class="clinic-screen">
      <p class="clinic-alarm">High priority · Chiller trip · active</p>
      <div class="clinic-values">
        <p>
          {{
            repairWords
              ? "Occupied cooling supply-temperature target"
              : "SAT SP OCC CLG"
          }}: <strong>{{ reading }}</strong>
        </p>
        <p>
          Valve position fraction:
          <strong>{{ repairNumbers ? "0.5" : ".5" }}</strong>
        </p>
        <div :class="{ 'aligned-numbers': repairNumbers }">
          <span>9.9</span><span>10.0</span><span>99.9</span>
        </div>
      </div>
      <p v-if="!repairActions"><u>Sensor detail (not actually a link)</u></p>
      <button
        v-else
        @click="
          message =
            'Sensor diagnostic view opened. No process command was sent.'
        "
      >
        Open sensor details
      </button>
      <button
        :class="repairActions ? 'danger-button' : 'primary'"
        @click="
          message =
            'Stop request requires separate confirmation; no command sent.'
        "
      >
        {{ repairActions ? "Review fan stop" : "STOP / DETAIL" }}
      </button>
      <button ref="opener" @click="show">Open faceplate</button>
      <div
        v-if="open"
        ref="faceplate"
        tabindex="-1"
        role="dialog"
        aria-label="Example equipment faceplate"
        class="clinic-popup"
        :class="{ 'covers-alarm': !repairPopup, 'popup-moved': moved }"
      >
        <h3>Equipment faceplate</h3>
        <p>
          {{
            repairPopup
              ? "Alarm strip remains visible."
              : "This placement covers the alarm strip: repair the popup layout."
          }}
        </p>
        <p>Closes in {{ remaining }} seconds · example timeout</p>
        <div class="actions">
          <button @click="moved = !moved">Move faceplate</button
          ><button @click="remaining += 12">Extend timeout</button
          ><button @click="close">Close faceplate</button>
        </div>
      </div>
    </div>
    <p role="status">{{ message }}</p>
    <div class="lesson-note">
      <strong>Use numeric context, not decorative precision.</strong>
      <p>
        Leading zeros aid recognition of fractions; precision should fit the
        measurement. Aligned fields and a stable decimal position help scanning.
        Input fields should look editable, labels should use familiar mixed-case
        language, and disabled actions should remain visible. This clinic
        deliberately starts with poor choices.
      </p>
    </div>
    <p class="source">
      § 7.2.1.2–7.2.1.6; Table 7 · Standard guidance. Values, repaired examples
      and timeout are ACE choices. The popup is a simulated non-modal faceplate;
      its focus and timeout controls are available to the learner.
    </p>
  </section>
</template>
