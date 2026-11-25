<script setup lang="ts">
import { ref } from "vue";
import {
  isEndpointConfigured,
  isValidEmail,
  normalizeEmail,
  privacyPolicyUrl,
  type Participant,
} from "../lib/quiz-results";
const props = defineProps<{ initialEmail?: string }>();
const emit = defineEmits<{ register: [participant: Participant] }>();
const email = ref(props.initialEmail ?? "");
const accepted = ref(false),
  website = ref(""),
  error = ref("");
const remoteConfigured = isEndpointConfigured();
function register() {
  if (website.value) return;
  if (!isValidEmail(email.value)) {
    error.value = "Enter a valid email address.";
    return;
  }
  if (!accepted.value) {
    error.value = "Accept the privacy policy to continue.";
    return;
  }
  emit("register", {
    version: 1,
    email: normalizeEmail(email.value),
    consentAt: new Date().toISOString(),
    remoteConsent: remoteConfigured,
  });
}
</script>
<template>
  <section class="panel participant-card" aria-labelledby="participant-title">
    <span class="eyebrow">SAVE YOUR RESULTS</span>
    <h2 id="participant-title">Enter your email to begin</h2>
    <p v-if="remoteConfigured">
      We use your email to save completed quiz results to the HMI Primer
      learning record and, when connected, the associated Pipedrive contact.
      This does not subscribe you to marketing.
    </p>
    <p v-else>
      Results collection is not connected here. Your email and quiz progress
      stay in this browser.
    </p>
    <form @submit.prevent="register">
      <label class="field"
        >Email address<input
          v-model.trim="email"
          type="email"
          required
          maxlength="254"
          autocomplete="email"
          placeholder="you@example.com"
          @input="error = ''"
      /></label>
      <label class="consent-field"
        ><input v-model="accepted" type="checkbox" required /><span
          >I agree to storage of my email and quiz results as described in the
          <a :href="privacyPolicyUrl" target="_blank" rel="noopener noreferrer"
            >privacy policy</a
          >.</span
        ></label
      >
      <label class="honeypot" aria-hidden="true"
        >Website<input
          v-model="website"
          type="text"
          tabindex="-1"
          autocomplete="off"
      /></label>
      <p v-if="error" role="alert" class="error-text">{{ error }}</p>
      <button class="primary" type="submit">Start competency quiz</button>
    </form>
  </section>
</template>
