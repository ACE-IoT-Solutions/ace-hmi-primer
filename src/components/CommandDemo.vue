<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import {
  advanceWrite,
  requestWrite,
  validateTarget,
  type LabSnapshot,
  type WriteState,
} from "../lib/lab";
import { toCelsius, useTemperatureUnits } from "../lib/units";
const props = defineProps<{ snapshot: LabSnapshot; valveMode?: boolean }>();
const emit = defineEmits<{
  state: [value: WriteState];
  valveAccepted: [value: number];
}>();
const isValve = computed(
  () => props.valveMode || Boolean(props.snapshot.points.coolingValve.override),
);
const target = defineModel<number>("target", { required: true });
const units = useTemperatureUnits();
const draft = ref(
  isValve.value
    ? String(props.snapshot.controlDemand)
    : units.value(target.value),
);
const format = (value: number) =>
  isValve.value ? `${value.toFixed(1)}%` : units.temperature(value);
const pending = ref<number | null>(null),
  error = ref("");
const state = ref<WriteState>({ phase: "idle", message: "No command sent." });
watch(state, (value) => emit("state", value), { deep: true });
let timer: ReturnType<typeof setTimeout> | undefined;
watch(units.unit, () => {
  pending.value = null;
  draft.value = isValve.value
    ? String(props.snapshot.controlDemand)
    : units.value(target.value);
  error.value = "";
});
onUnmounted(() => clearTimeout(timer));
function request() {
  const numeric = Number(draft.value);
  if (isValve.value) {
    error.value =
      !draft.value.trim() ||
      !Number.isFinite(numeric) ||
      numeric < 0 ||
      numeric > 100
        ? "Valve command must be between 0 and 100%. No command sent."
        : "";
    if (error.value) {
      pending.value = null;
      return;
    }
    pending.value = numeric;
    state.value = requestWrite(numeric);
    return;
  }
  error.value =
    !draft.value.trim() || !Number.isFinite(numeric)
      ? "Enter a numeric target."
      : Math.abs(numeric * 10 - Math.round(numeric * 10)) > 1e-8
        ? "Use no more than one decimal place."
        : validateTarget(String(toCelsius(numeric, units.unit.value)));
  // Unit conversion may produce fractions; enforce user precision in displayed units, then limits in °C.
  const c = toCelsius(numeric, units.unit.value);
  if (
    Number.isFinite(c) &&
    c >= 12 - 1e-8 &&
    c <= 20 + 1e-8 &&
    Math.abs(numeric * 10 - Math.round(numeric * 10)) < 1e-8
  )
    error.value = "";
  if (error.value) {
    error.value = `Target must be between ${units.temperature(12)} and ${units.temperature(20)}, with at most one decimal place. No command sent.`;
    pending.value = null;
    return;
  }
  pending.value = c;
  state.value = requestWrite(c);
}
function confirm() {
  if (pending.value === null || state.value.phase === "pending") return;
  const requested = pending.value;
  const blocked =
    (isValve.value && Boolean(props.snapshot.points.coolingValve.override)) ||
    props.snapshot.commState === "disconnected";
  pending.value = null;
  state.value = advanceWrite(requestWrite(requested), blocked);
  timer = setTimeout(() => {
    state.value = advanceWrite(state.value, blocked);
    if (props.snapshot.commState === "disconnected")
      state.value = {
        ...state.value,
        phase: "rejected",
        message:
          "Rejected: controller connection is unavailable. No acceptance or process response can be inferred.",
      };
    if (state.value.phase === "accepted") {
      if (isValve.value) emit("valveAccepted", requested);
      else target.value = requested;
    }
  }, 900);
}
function cancel() {
  pending.value = null;
  state.value = { phase: "idle", message: "Change canceled. No command sent." };
}
</script>
<template>
  <section class="panel command-demo">
    <div>
      <span class="eyebrow">S3 · Write lifecycle</span>
      <h2>Intent. Acceptance. Response.</h2>
      <p>
        A locally echoed entry is not controller acceptance. Review, confirm,
        wait for the simulated poll, then inspect controller acceptance. The
        valve demo tests a competing write to the overridden valve point, not to
        the temperature target. Lost communications prevent either write.
      </p>
      <p>
        {{ isValve ? "Effective valve command" : "Accepted target" }}:
        <strong>{{
          isValve ? format(snapshot.valveCommand) : units.temperature(target)
        }}</strong
        >. Measured supply temperature:
        <strong>{{ units.temperature(snapshot.actual) }}</strong> ({{
          snapshot.stale ? "retained" : "unchanged snapshot"
        }}).
      </p>
      <p v-if="snapshot.points.coolingValve.override" class="notice">
        Higher-priority override active. The request will be rejected; the
        effective valve command remains unchanged.
      </p>
      <p class="source">
        § 7.2.1.4(b, g), 7.2.3, 8.3.3–8.3.4 · Standard guidance. The 900 ms
        delay and
        {{
          isValve
            ? "0–100%"
            : `${units.temperature(12)}–${units.temperature(20)}`
        }}
        limits are ACE examples. Write time ends at controller receipt; write
        refresh ends when feedback is displayed.
      </p>
    </div>
    <div>
      <form @submit.prevent="request">
        <label class="field"
          >{{
            isValve
              ? "Requested cooling valve command · %"
              : `Requested supply temperature · ${units.label()}`
          }}<input
            v-model="draft"
            inputmode="decimal"
            :aria-invalid="!!error"
            aria-describedby="target-feedback"
            :disabled="state.phase === 'pending'"
        /></label>
        <p v-if="error" class="error-text" role="alert">{{ error }}</p>
        <button class="primary" :disabled="state.phase === 'pending'">
          Review change
        </button>
      </form>
      <div v-if="pending !== null" class="notice">
        <p>
          Send {{ isValve ? "valve command" : "target" }} {{ format(pending) }}?
          Current accepted value:
          {{
            isValve ? format(snapshot.valveCommand) : units.temperature(target)
          }}.
        </p>
        <div class="actions">
          <button class="primary" @click="confirm">
            Confirm simulated change</button
          ><button @click="cancel">Cancel</button>
        </div>
      </div>
      <p id="target-feedback" role="status">
        <strong>{{ state.phase.toUpperCase() }}</strong> · {{ state.message }}
      </p>
      <p class="muted">
        Navigation alone cannot send a process command. The confirmation guards
        against a single accidental input. No physical equipment is controlled.
      </p>
    </div>
  </section>
</template>
