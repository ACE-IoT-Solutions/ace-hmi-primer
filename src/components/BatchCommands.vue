<script setup lang="ts">
import { computed, ref } from "vue";
const role = ref("operator"),
  selected = ref(["AHU-01", "AHU-02", "AHU-03"]);
const modes = ref<Record<string, string>>({
  "AHU-01": "Occupied",
  "AHU-02": "Occupied",
  "AHU-03": "Occupied",
});
const pending = ref<string[]>([]),
  undo = ref<Record<string, string> | null>(null),
  message = ref("");
const unusual = ref(""),
  reason = ref(""),
  reasonError = ref("");
const disabled = computed(
  () => role.value !== "operator" || !selected.value.length,
);
function review() {
  if (disabled.value) return;
  pending.value = [...selected.value];
}
function apply() {
  if (role.value !== "operator") return;
  undo.value = { ...modes.value };
  for (const id of pending.value) modes.value[id] = "Unoccupied";
  message.value = `Confirmed unoccupied mode for ${pending.value.join(", ")}.`;
  pending.value = [];
}
function restore() {
  if (role.value !== "operator" || !undo.value) return;
  modes.value = undo.value;
  undo.value = null;
  message.value = "Previous modes restored by an explicit simulated undo.";
}
function saveException() {
  reasonError.value = "";
  const value = Number(unusual.value);
  if (
    !unusual.value.trim() ||
    !Number.isFinite(value) ||
    value < 10 ||
    value > 30
  ) {
    reasonError.value =
      "Enter a finite value within this example’s absolute 10–30 °C safety bounds.";
    return;
  }
  if ((value < 12 || value > 20) && !reason.value.trim()) {
    reasonError.value =
      "A value outside the expected 12–20 °C range requires a recorded reason.";
    return;
  }
  message.value = `Recorded ${value.toFixed(1)} °C with reason: ${reason.value.trim() || "Within expected range"}. No real process command sent.`;
}
</script>
<template>
  <section class="panel exercise-panel">
    <span class="eyebrow">S7 · Multi-unit mode change</span>
    <h2>Confirm the affected equipment, not just the verb.</h2>
    <label class="field"
      >User role<select v-model="role" @change="pending = []">
        <option value="operator">Operator · process commands allowed</option>
        <option value="viewer">Viewer · read-only</option>
      </select></label
    >
    <div class="batch-equipment">
      <label v-for="(mode, id) in modes" :key="id" class="toggle"
        ><input v-model="selected" type="checkbox" :value="id" />{{ id }} ·
        {{ mode }}</label
      >
    </div>
    <button class="primary" :disabled="disabled" @click="review">
      Review unoccupied mode change
    </button>
    <p v-if="role === 'viewer'" class="muted">
      The command remains visible but unavailable for this role. These UI
      restrictions illustrate access design; they are not an authentication
      system.
    </p>
    <div v-if="pending.length" class="notice">
      <h3>Confirm this exact list</h3>
      <ul>
        <li v-for="id in pending" :key="id">
          {{ id }} · {{ modes[id] }} to Unoccupied
        </li>
      </ul>
      <div class="actions">
        <button class="primary" @click="apply">Confirm listed AHUs</button
        ><button
          @click="
            pending = [];
            message = 'Canceled. Modes unchanged.';
          "
        >
          Cancel batch change
        </button>
      </div>
    </div>
    <button v-if="undo" :disabled="role !== 'operator'" @click="restore">
      Undo last mode change
    </button>
    <p role="status">{{ message }}</p>
    <p class="source">
      § 7.2.1.4(c, f); 7.2.3; 7.2.5 · Standard guidance; equipment, permissions
      and undo are ACE examples.
    </p>
  </section>
  <section class="panel exercise-panel">
    <h2>Record a reason for an unusual entry.</h2>
    <p>
      Some facilities allow an entry outside an expected range when the reason
      is recorded. That does not bypass hard safety or equipment limits. This
      example is explicitly in °C to make its two ranges unambiguous.
    </p>
    <form @submit.prevent="saveException">
      <label class="field"
        >Exceptional temperature target · °C<input
          v-model="unusual"
          inputmode="decimal" /></label
      ><label class="field"
        >Reason for exception<input v-model="reason" maxlength="300" /></label
      ><button :disabled="role !== 'operator'">Record exceptional entry</button>
      <p v-if="reasonError" class="error-text" role="alert">
        {{ reasonError }}
      </p>
    </form>
    <p class="source">
      § 7.2.3; 7.2.5 · Standard guidance; expected and absolute limits are ACE
      choices. A required reason does not itself grant authorization.
    </p>
  </section>
</template>
