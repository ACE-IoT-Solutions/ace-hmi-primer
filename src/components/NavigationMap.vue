<script setup lang="ts">
import { computed, ref } from "vue";
const mode = ref("hierarchical"),
  location = ref("Campus"),
  clicks = ref(0),
  yoked = ref(false),
  showTrend = ref(false),
  showFaceplate = ref(false);
const links = computed(() =>
  mode.value === "hierarchical"
    ? location.value === "Campus"
      ? ["West building"]
      : location.value === "West building"
        ? ["AHU-01", "Campus"]
        : ["West building", "Alarm summary"]
    : location.value === "Campus"
      ? ["Chiller-01", "AHU-01", "Alarm summary"]
      : ["Chiller-01", "AHU-01", "Zone 101", "Alarm summary", "Campus"].filter(
          (v) => v !== location.value,
        ),
);
function reset() {
  location.value = "Campus";
  clicks.value = 0;
  showTrend.value = false;
  showFaceplate.value = false;
}
function navigate(target: string) {
  location.value = target;
  clicks.value++;
  if (target === "AHU-01" && yoked.value) {
    showTrend.value = true;
    showFaceplate.value = true;
  }
}
</script>
<template>
  <section class="panel exercise-panel">
    <span class="eyebrow">S9 · Navigation map and yoking</span>
    <h2>Make relationships easy to follow.</h2>
    <label class="field"
      >Navigation design<select v-model="mode" @change="reset">
        <option value="hierarchical">
          Hierarchical · campus, building, equipment
        </option>
        <option value="relational">Relational · plant and consumers</option>
      </select></label
    ><label class="toggle"
      ><input v-model="yoked" type="checkbox" /> Yoke the AHU faceplate and
      trend</label
    >
    <div class="navigation-network" aria-label="Navigation network drawing">
      <template v-if="mode === 'hierarchical'"
        ><span>Campus</span><span>West building</span
        ><span>AHU-01</span></template
      ><template v-else
        ><span>Chiller-01</span><span>AHU-01</span><span>Zone 101</span
        ><span>Alarm summary</span></template
      >
    </div>
    <p>
      <strong>Current display: {{ location }}</strong> · Navigation actions:
      {{ clicks }}
    </p>
    <nav class="actions" aria-label="Teaching display navigation">
      <button v-for="link in links" :key="link" @click="navigate(link)">
        Open {{ link }}</button
      ><button @click="reset">Reset navigation</button>
    </nav>
    <div class="yoked-views">
      <section v-if="showFaceplate" class="lesson-note">
        <h3>AHU-01 faceplate</h3>
        <p>Routine control context opened by the AHU selection.</p>
      </section>
      <section v-if="showTrend" class="lesson-note">
        <h3>AHU-01 trend</h3>
        <p>Related temperature history opened by that same selection.</p>
      </section>
    </div>
    <p>
      Hierarchical navigation follows an area structure; relational navigation
      follows functional dependencies such as a shared central plant. Sequential
      navigation is suited to ordered procedures. Yoking opens related views
      together; it does not imply a process command.
    </p>
    <p class="source">
      § 7.2.2; Table 8 · Standard guidance. Table 8 gives example access
      targets: an alarm summary in one selection, critical displays in one or
      two, and noncritical displays in three. These are examples for
      establishing project criteria, not universal requirements. This small
      network is an ACE teaching drawing.
    </p>
  </section>
</template>
