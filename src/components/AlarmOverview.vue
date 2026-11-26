<script setup lang="ts">
import { computed, ref } from "vue";
import { alarmsForLevel, orderAlarms, type LabSnapshot } from "../lib/lab";
const props = defineProps<{ snapshot: LabSnapshot }>();
const emit = defineEmits<{ acknowledge: [id: string] }>();
const level = ref(1),
  choice = ref(""),
  attempted = ref(false);
const visible = computed(() =>
  alarmsForLevel(props.snapshot.alarms, level.value),
);
const lowCount = computed(
  () =>
    props.snapshot.alarms.filter(
      (a) => a.kind === "alarm" && a.priority === "low",
    ).length,
);
const alerts = computed(() =>
  props.snapshot.alarms.filter((a) => a.kind === "alert"),
);
</script>
<template>
  <section class="panel exercise-panel">
    <span class="eyebrow">S1 · Multiple simultaneous upsets</span>
    <h2>Find the upstream condition.</h2>
    <p>
      One chiller trip affects an AHU and its zones. The filter reminder is an
      alert, not a process alarm requiring the same response. Priorities are
      illustrative site assignments, not priorities prescribed by ISA-101.
    </p>
    <ol class="propagation-path" aria-label="Disturbance propagation">
      <li>Chiller-01 · Trip · High</li>
      <li>AHU-01 · Supply temperature high · Medium</li>
      <li>Zone 101 · Comfort limit exceeded · Low</li>
    </ol>
    <label class="field"
      >Display level<select v-model.number="level">
        <option :value="1">Level 1 · Overview</option>
        <option :value="2">Level 2 · Operating area</option>
        <option :value="3">Level 3 · Equipment detail</option>
      </select></label
    >
    <ul class="alarm-list">
      <li
        v-for="alarm in visible"
        :key="alarm.id"
        class="alarm-item"
        :class="{ 'alarm-unacknowledged': !alarm.acknowledged }"
      >
        <div>
          <strong
            >{{ alarm.priority.toUpperCase() }} · {{ alarm.equipment }}</strong
          ><span
            >{{ alarm.message }} · ACTIVE ·
            {{ alarm.acknowledged ? "Acknowledged" : "Unacknowledged" }}</span
          >
        </div>
        <button
          :disabled="alarm.acknowledged"
          @click="emit('acknowledge', alarm.id)"
        >
          {{ alarm.acknowledged ? "Acknowledged" : "Acknowledge" }}
        </button>
      </li>
    </ul>
    <p v-if="level === 2 && lowCount" class="notice">
      {{ lowCount }} low-priority alarm remains in detail.
      <button @click="level = 3">Open equipment detail</button>
    </p>
    <p v-if="level === 1" class="muted">
      Overview shows the top-priority alarm. Lower-level symptoms remain active;
      this overview is not the full alarm list.
    </p>
    <p v-for="alert in alerts" :key="alert.id" class="maintenance-alert">
      <strong>Alert:</strong> {{ alert.message }} · separate maintenance work
      queue
    </p>
    <form @submit.prevent="attempted = true">
      <label class="field"
        >Which condition should be investigated first?<select
          v-model="choice"
          required
        >
          <option value="" disabled>Select a condition</option>
          <option
            v-for="alarm in orderAlarms(snapshot.alarms)"
            :key="alarm.id"
            :value="alarm.id"
          >
            {{ alarm.message }}
          </option>
        </select></label
      ><button>Check priority reasoning</button>
    </form>
    <p v-if="attempted" role="status">
      {{
        choice === "chiller-trip"
          ? "The chiller trip is the upstream high-priority condition in this scenario."
          : "Revisit the priority labels and propagation path. The filter alert and downstream symptoms do not replace the high-priority chiller investigation."
      }}
    </p>
    <div class="lesson-note">
      <strong>Acknowledge is not resolve.</strong>
      <p>
        Acknowledgement stops the border animation while the active alarm
        indication remains. Reduced-motion preferences suppress animation
        entirely; text still distinguishes acknowledgement. No sound is
        autoplayed. Audible indications should reinforce the visual state, suit
        the environment, avoid startling users, and allow appropriate silencing
        after acknowledgement.
      </p>
    </div>
    <p class="source">
      § 3.1.1–3.1.2; 5.1(c); 5.2.1.5; 5.2.2; 6.3.1–6.3.3 · Standard guidance and
      required design considerations. Alarm management details also belong to
      the facility’s ISA-18.2 alarm philosophy.
    </p>
  </section>
</template>
