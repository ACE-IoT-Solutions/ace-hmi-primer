<script setup lang="ts">
import { computed, ref } from "vue";
import { displayStyles, styleTasks } from "../data/display-styles";
const task = ref(0),
  choice = ref(""),
  checked = ref(false);
const current = computed(() => styleTasks[task.value]!);
</script>
<template>
  <section class="panel exercise-panel">
    <span class="eyebrow">S8 · Choose the display style</span>
    <h2>Choose a representation for the task.</h2>
    <p>
      These are original building examples based on the style families in Table
      6. More than one style may support a task; this exercise asks for the
      closest match to the stated purpose, not a universal prescribed format.
    </p>
    <label class="field"
      >Operator task<select
        v-model.number="task"
        @change="
          checked = false;
          choice = '';
        "
      >
        <option v-for="(item, i) in styleTasks" :key="item.task" :value="i">
          {{ item.task }}
        </option>
      </select></label
    >
    <form @submit.prevent="checked = true">
      <label class="field"
        >Display style<select v-model="choice" required>
          <option value="" disabled>Choose a style</option>
          <option v-for="style in displayStyles" :key="style[0]">
            {{ style[0] }}
          </option>
        </select></label
      ><button>Review style choice</button>
    </form>
    <p v-if="checked" class="notice" role="status">
      {{
        choice === current.answer
          ? "A strong match."
          : `Consider ${current.answer} for this stated task.`
      }}
      {{ current.reason }}
    </p>
    <div class="comparison-table-wrap">
      <table class="comparison-table">
        <caption>
          Display-style families · original summaries and examples
        </caption>
        <thead>
          <tr>
            <th>Style</th>
            <th>Purpose</th>
            <th>Building example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="style in displayStyles" :key="style[0]">
            <th>{{ style[0] }}</th>
            <td>{{ style[1] }}</td>
            <td>{{ style[2] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="source">
      § 6.1–6.2; Table 6 · Standard guidance and ACE examples. Styles are chosen
      from functional requirements; Table 6 is not a required menu of pages.
    </p>
  </section>
</template>
