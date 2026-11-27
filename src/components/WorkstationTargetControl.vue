<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import type { LabSnapshot, WriteState } from "../lib/lab";
import { toCelsius, useTemperatureUnits } from "../lib/units";
const props = defineProps<{ snapshot: LabSnapshot }>();
const target = defineModel<number>("target", { required: true });
const emit = defineEmits<{ state: [value: WriteState]; close: [] }>();
const units = useTemperatureUnits();
const draft = ref(units.value(target.value)),
  pending = ref<number | null>(null),
  error = ref("");
const busy = ref(false);
watch(units.unit, () => {
  draft.value = units.value(target.value);
  pending.value = null;
  error.value = "";
});
let timer: ReturnType<typeof setTimeout> | undefined;
onUnmounted(() => clearTimeout(timer));
const measured = computed(() => units.temperature(props.snapshot.actual));
function review() {
  const numeric = Number(draft.value),
    celsius = toCelsius(numeric, units.unit.value);
  if (
    !draft.value.trim() ||
    !Number.isFinite(celsius) ||
    celsius < 12 - 1e-8 ||
    celsius > 20 + 1e-8 ||
    Math.abs(numeric * 10 - Math.round(numeric * 10)) > 1e-8
  ) {
    error.value = `Enter ${units.temperature(12)}–${units.temperature(20)}, at most one decimal place.`;
    pending.value = null;
    return;
  }
  error.value = "";
  pending.value = celsius;
}
function confirm() {
  if (pending.value === null || busy.value) return;
  const requested = pending.value;
  busy.value = true;
  pending.value = null;
  emit("state", {
    phase: "pending",
    requested,
    message: "Awaiting controller acknowledgement.",
  });
  timer = setTimeout(() => {
    busy.value = false;
    if (props.snapshot.commState === "disconnected")
      emit("state", {
        phase: "rejected",
        requested,
        message: "Controller unavailable; target was not accepted.",
      });
    else {
      target.value = requested;
      emit("state", {
        phase: "accepted",
        requested,
        message:
          "Controller accepted target. Process response remains unverified.",
      });
    }
  }, 900);
}
</script>
<template>
  <section
    class="ws-target-control"
    role="dialog"
    aria-label="Supply temperature controller"
  >
    <header class="ws-panel-heading">
      <strong>SAT-01 / Temperature controller</strong
      ><button aria-label="Close temperature controller" @click="emit('close')">
        ×
      </button>
    </header>
    <div class="ws-pad">
      <dl class="ws-keyvalue">
        <div>
          <dt>Process value</dt>
          <dd>{{ measured }}{{ snapshot.stale ? " · RETAINED" : "" }}</dd>
        </div>
        <div>
          <dt>Accepted setpoint</dt>
          <dd>{{ units.temperature(target) }}</dd>
        </div>
      </dl>
      <form @submit.prevent="review">
        <label
          >Requested supply temperature
          <input
            v-model="draft"
            type="text"
            inputmode="decimal"
            :disabled="busy" /></label
        ><small
          >{{ units.label() }} · permitted {{ units.temperature(12) }}–{{
            units.temperature(20)
          }}</small
        >
        <p v-if="error" role="alert" class="ws-bad-text">{{ error }}</p>
        <button :disabled="busy" type="submit">Review change</button>
      </form>
      <div v-if="pending !== null" class="ws-confirm">
        <strong>Set target to {{ units.temperature(pending) }}?</strong>
        <p>Current accepted target {{ units.temperature(target) }}.</p>
        <button @click="confirm">Confirm target</button
        ><button @click="pending = null">Cancel</button>
      </div>
      <p v-if="busy" role="status">Write pending · waiting for controller</p>
      <p v-else id="target-feedback" role="status">
        {{ snapshot.writeState.message }}
      </p>
    </div>
  </section>
</template>
<style scoped>
.ws-target-control {
  border: 1px solid #6c818f;
  box-shadow: 0 8px 24px #253e4e30;
  background: #fafbfc;
  width: min(400px, 100%);
}
form {
  margin-top: 1rem;
}
label,
small {
  display: block;
}
input {
  width: 100%;
  margin: 0.4rem 0;
}
form > button {
  margin: 0.6rem 0;
}
.ws-confirm {
  background: #e6edf1;
  padding: 0.7rem;
}
.ws-confirm button {
  margin-right: 0.5rem;
}
</style>
