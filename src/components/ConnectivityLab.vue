<script setup lang="ts">
import { computed, ref } from "vue";
import type { LabSnapshot } from "../lib/lab";
const props = defineProps<{ snapshot: LabSnapshot }>();
const monitor = ref(false),
  backup = ref(false),
  testSent = ref(false);
const status = computed(() =>
  !testSent.value
    ? "Notification not tested."
    : monitor.value
      ? backup.value
        ? "Primary SMS service failed; monitored failure detected and backup call route used."
        : "Primary SMS service failed; failure detected but no backup route is configured."
      : "Primary SMS service failed silently. No availability monitoring or confirmed delivery.",
);
</script>
<template>
  <section class="panel exercise-panel">
    <span class="eyebrow">S4 · Whole-display connection failure</span>
    <h2>Rendering is not communications health.</h2>
    <div class="notice" role="status">
      <strong>{{
        snapshot.commState === "disconnected"
          ? "Display connection lost"
          : "Controller link connected"
      }}</strong>
      <p>
        {{
          snapshot.commState === "disconnected"
            ? "Every process value is retained. Current fan proof, valve output, and temperature are unknown. Browser animation may continue."
            : "Only the selected point may be stale. A point failure and a whole-display failure have different scopes."
        }}
      </p>
    </div>
    <dl class="diagnostic-grid">
      <div>
        <dt>Browser rendering</dt>
        <dd>Available</dd>
      </div>
      <div>
        <dt>Controller communications</dt>
        <dd>
          {{
            snapshot.commState === "disconnected"
              ? "Failed · last successful read 12 min ago"
              : "Available"
          }}
        </dd>
      </div>
      <div>
        <dt>Temperature point quality</dt>
        <dd>{{ snapshot.points.supplyTemperature.quality }}</dd>
      </div>
      <div>
        <dt>Valve point quality</dt>
        <dd>{{ snapshot.points.coolingValve.quality }}</dd>
      </div>
    </dl>
    <p>
      Use the comparison exercise’s
      <strong>Whole display disconnected</strong> scenario to see both displays
      retain the same data while the motion continues.
    </p>
    <p class="source">
      § 5.1(d); 5.1.4; Table 6 health/diagnostic style · Required design
      consideration and standard guidance.
    </p>
  </section>
  <section class="panel exercise-panel">
    <span class="eyebrow">S5 · After hours, nobody notified</span>
    <h2>Who finds out when the notification path fails?</h2>
    <p>
      A chiller alarm occurs in an unmanned control room. The primary SMS
      service is unavailable. Design availability monitoring and a backup path,
      then run the teaching test.
    </p>
    <label class="toggle"
      ><input v-model="monitor" type="checkbox" /> Monitor notification-service
      availability</label
    ><label class="toggle"
      ><input v-model="backup" type="checkbox" /> Configure an independent
      backup call route</label
    ><button class="primary" @click="testSent = true">
      Test simulated notification
    </button>
    <p class="notice" role="status">{{ status }}</p>
    <p>
      Submission to an email/SMS service is not proof that an operator received
      or acted on a message. Decide monitoring, escalation, responsibilities,
      and backup arrangements from the actual operating requirements.
    </p>
    <p class="source">
      § 7.2.4 · Standard guidance; the failure and backup route are ACE
      examples. This exercise sends no email, SMS, or calls.
    </p>
  </section>
</template>
