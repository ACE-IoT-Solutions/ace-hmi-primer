<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import DesignLab from "./components/DesignLab.vue";
import QuizPage from "./components/QuizPage.vue";
import { lessons, standardTitle, standardUrl } from "./data/lessons";
import LessonCards from "./components/LessonCards.vue";
import { checklist } from "./data/review-checklist";
import { questions } from "./lib/quiz";
import { glossary } from "./data/glossary";
import aceMark from "./assets/brand/ace-mark.svg";

type Page = "learn" | "lab" | "quiz" | "glossary" | "review";
const nav: { id: Page; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "lab", label: "Design lab" },
  { id: "quiz", label: "Quiz" },
  { id: "glossary", label: "Glossary" },
  { id: "review", label: "Review checklist" },
];
const page = ref<Page>("learn");
const activeLesson = ref("purpose");
const lesson = computed(
  () => lessons.find((l) => l.id === activeLesson.value) ?? lessons[0]!,
);
const search = ref("");
const filteredGlossary = computed(() =>
  glossary.filter((item) =>
    item.join(" ").toLowerCase().includes(search.value.toLowerCase()),
  ),
);
const completed = ref<string[]>([]);
const storageWarning = ref("");
const checks = ref<string[]>([]);

function syncHash() {
  const [target, id] = window.location.hash.slice(1).split("/");
  page.value = nav.some((n) => n.id === target) ? (target as Page) : "learn";
  if (id && lessons.some((l) => l.id === id)) activeLesson.value = id;
}
function navigate(target: Page, id?: string) {
  window.location.hash = `${target}${id ? `/${id}` : ""}`;
}
function openLesson(id: string) {
  navigate("learn", id);
}
function selectLesson(id: string) {
  activeLesson.value = id;
  navigate("learn", id);
  nextTick(() => document.getElementById("lesson-content")?.focus());
}
function markComplete() {
  completed.value = completed.value.includes(lesson.value.id)
    ? completed.value.filter((id) => id !== lesson.value.id)
    : [...completed.value, lesson.value.id];
  try {
    localStorage.setItem("ace-hmi-lessons-v1", JSON.stringify(completed.value));
  } catch {
    storageWarning.value =
      "Lesson completion could not be saved. It will last for this visit.";
  }
}
function printChecklist() {
  window.print();
}
function startLearning() {
  nextTick(() =>
    document
      .getElementById("lesson-content")
      ?.scrollIntoView({ behavior: "smooth" }),
  );
}
onMounted(() => {
  syncHash();
  window.addEventListener("hashchange", syncHash);
  try {
    const saved = JSON.parse(
      localStorage.getItem("ace-hmi-lessons-v1") ?? "[]",
    );
    if (Array.isArray(saved))
      completed.value = saved.filter(
        (id) => typeof id === "string" && lessons.some((l) => l.id === id),
      );
  } catch {
    storageWarning.value =
      "Saved lesson progress could not be read. You can still use every lesson.";
  }
});
onUnmounted(() => window.removeEventListener("hashchange", syncHash));
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="#learn" aria-label="ACE HMI Primer home"
      ><img class="brand-logo" :src="aceMark" alt="" aria-hidden="true" /><span
        ><strong>HMI PRIMER</strong><small>BY ACE IoT</small></span
      ></a
    ><span class="header-caption">DESIGN FOR THE HUMAN IN THE LOOP</span
    ><a class="standard-link" :href="standardUrl" target="_blank" rel="noopener"
      >ISA-101 source</a
    >
  </header>
  <nav class="main-nav" aria-label="Main navigation">
    <a
      v-for="item in nav"
      :key="item.id"
      :href="`#${item.id}`"
      :aria-current="page === item.id ? 'page' : undefined"
      >{{ item.label }}</a
    >
  </nav>
  <main id="main" tabindex="-1">
    <template v-if="page === 'learn'">
      <section class="hero">
        <div>
          <span class="eyebrow">A PRACTICAL INTRODUCTION TO ISA-101</span>
          <h1>Good displays.<br /><em>Better decisions.</em></h1>
          <p>
            Help operators see what matters, understand what is changing, and
            act with confidence. Learn the principles behind effective
            human-machine interfaces.
          </p>
          <div class="actions">
            <a
              class="primary button"
              href="#learn/purpose"
              @click="startLearning"
              >Start learning</a
            ><a class="button" href="#lab">Open the design lab</a>
          </div>
          <p class="hero-meta">
            {{ lessons.length }} lessons · 12 lab exercises ·
            {{ questions.length }} practice questions
          </p>
        </div>
        <div
          class="hero-preview"
          aria-label="Illustrative HMI temperature display"
        >
          <div class="section-top">
            <span>AHU-01 / SUPPLY AIR</span
            ><span class="tag">DESIGN STUDY</span>
          </div>
          <div class="preview-value">
            24.4 <span>°C</span><small>Target 16.0 °C</small>
          </div>
          <svg
            viewBox="0 0 340 100"
            role="img"
            aria-label="Temperature rising above its target"
          >
            <path d="M0 70H340 M0 35H340" stroke="#444b5b" stroke-width="1" />
            <path
              d="M0 72L55 69L110 64L165 52L220 35L275 20L340 4"
              fill="none"
              stroke="#adfcf9"
              stroke-width="3"
            />
            <path
              d="M0 76H340"
              fill="none"
              stroke="#aeb3bf"
              stroke-dasharray="6 5"
            />
          </svg>
          <div class="preview-alert">⚠ SUPPLY TEMPERATURE HIGH</div>
          <p>Actual. Target. Direction. A reason to pay attention.</p>
        </div>
      </section>
      <div class="course-bar">
        <span
          ><strong>{{ completed.length }} of {{ lessons.length }}</strong>
          lessons marked complete</span
        ><progress
          :value="completed.length"
          :max="lessons.length"
          aria-label="Lessons marked complete"
        /><span>Based on {{ standardTitle }}</span>
      </div>
      <p v-if="storageWarning" role="status" class="notice">
        {{ storageWarning }}
      </p>
      <section class="learning-layout">
        <nav class="lesson-menu" aria-label="Lessons">
          <span class="eyebrow">THE LEARNING PATH</span
          ><a
            v-for="(item, i) in lessons"
            :key="item.id"
            :href="`#learn/${item.id}`"
            :aria-current="lesson.id === item.id ? 'true' : undefined"
            @click.prevent="selectLesson(item.id)"
            ><span class="lesson-number">{{
              String(i + 1).padStart(2, "0")
            }}</span
            ><span
              >{{ item.title
              }}<small v-if="completed.includes(item.id)"
                >Marked complete</small
              ></span
            ></a
          >
        </nav>
        <article id="lesson-content" class="panel lesson-content" tabindex="-1">
          <span class="eyebrow"
            >LESSON {{ lessons.indexOf(lesson) + 1 }} /
            {{ lessons.length }}</span
          >
          <h2>{{ lesson.title }}</h2>
          <p class="lead">{{ lesson.summary }}</p>
          <section v-for="section in lesson.sections" :key="section.title">
            <h3>{{ section.title }}</h3>
            <p>{{ section.text }}</p>
          </section>
          <LessonCards v-if="lesson.cards" :cards="lesson.cards" />
          <div class="lesson-note">
            <span class="eyebrow">IN A BUILDING</span>
            <p>{{ lesson.example }}</p>
          </div>
          <div class="exercise">
            <h3>Try it with your team</h3>
            <p>{{ lesson.exercise }}</p>
          </div>
          <p class="takeaway">{{ lesson.takeaway }}</p>
          <p class="source">
            {{ standardTitle }} · § {{ lesson.clauses }}<br />{{ lesson.basis }}
          </p>
          <div class="actions">
            <button
              :aria-pressed="completed.includes(lesson.id)"
              @click="markComplete"
            >
              {{
                completed.includes(lesson.id)
                  ? "Marked complete"
                  : "Mark lesson complete"
              }}</button
            ><button
              v-if="lessons.indexOf(lesson) < lessons.length - 1"
              class="primary"
              @click="selectLesson(lessons[lessons.indexOf(lesson) + 1]!.id)"
            >
              Next lesson</button
            ><a v-else class="primary button" href="#quiz"
              >Practice with the quiz</a
            >
          </div>
        </article>
      </section>
    </template>
    <DesignLab v-else-if="page === 'lab'" />
    <template v-else-if="page === 'glossary'"
      ><section class="page-heading">
        <span class="eyebrow">REFERENCE / GLOSSARY</span>
        <h1>A shared language for design.</h1>
        <p>
          Plain-language explanations with source locators. These are original
          summaries, not quoted definitions.
        </p>
      </section>
      <label class="field search-field"
        >Find a term<input
          v-model="search"
          type="search"
          placeholder="Try salience, faceplate, or validation"
      /></label>
      <p role="status" class="muted">{{ filteredGlossary.length }} terms</p>
      <dl class="glossary-grid">
        <div v-for="item in filteredGlossary" :key="item[0]" class="panel">
          <dt>{{ item[0] }}</dt>
          <dd>
            {{ item[1] }}<span class="source">{{ item[2] }}</span>
          </dd>
        </div>
      </dl>
      <p v-if="!filteredGlossary.length">
        No matching terms. Try a shorter search.
      </p></template
    >
    <template v-else-if="page === 'review'"
      ><section class="page-heading">
        <span class="eyebrow">TAKE IT TO YOUR PROJECT</span>
        <h1>Review the work, together.</h1>
        <p>
          A discussion checklist for a design review. Check marks are temporary
          for this visit. This is a learning aid, not an ISA compliance
          assessment.
        </p>
        <button class="primary" @click="printChecklist">
          Print review checklist
        </button>
      </section>
      <section class="panel checklist">
        <div class="section-top">
          <h2>HMI design review</h2>
          <span>{{ checks.length }} / {{ checklist.length }} reviewed</span>
        </div>
        <label v-for="item in checklist" :key="item.title" class="check-item"
          ><input v-model="checks" type="checkbox" :value="item.title" /><span
            ><strong>{{ item.title }}</strong
            ><span>{{ item.text }}</span
            ><small class="source">§ {{ item.clause }}</small></span
          ></label
        >
      </section>
      <section class="panel review-task">
        <h2>Record an acceptance task</h2>
        <p>
          For each critical task, record: starting condition; user role;
          information needed; expected action; acceptance criterion; observed
          result; deficiency owner; and retest evidence.
        </p>
        <p class="muted">
          Example: With AHU-01 supply temperature rising and cooling demand
          high, can an operator locate the abnormality and identify the evidence
          needed to investigate it? Set performance criteria from your
          facility’s actual requirements.
        </p>
      </section></template
    >
    <KeepAlive
      ><QuizPage v-if="page === 'quiz'" @lesson="openLesson"
    /></KeepAlive>
  </main>
  <footer>
    <div>
      <strong>HMI PRIMER <span>by ACE IoT</span></strong>
      <p>
        Original learning material based on {{ standardTitle }}. Building
        examples are illustrative. The standard governs; this resource does not
        certify conformity.
      </p>
    </div>
    <a :href="standardUrl" target="_blank" rel="noopener"
      >About the ISA-101 series</a
    >
    <p class="footer-note">
      Lesson and quiz progress save in this browser. When configured, completed
      quiz results are submitted with your consent. The licensed standard is not
      distributed with this app.
    </p>
  </footer>
</template>
