<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { lessons, standardTitle } from "../data/lessons";
import { downloadQuizResult } from "../lib/quiz-export";
import QuizParticipantForm from "./QuizParticipantForm.vue";
import {
  bindParticipant,
  buildResultPayload,
  isEndpointConfigured,
  participantKey,
  readParticipant,
  receiverQuestionPool,
  saveParticipant,
  submitResult,
  type Participant,
} from "../lib/quiz-results";
import {
  answerQuiz,
  byId,
  currentAttempts,
  emptyProgress,
  latestCorrect,
  mastered,
  nextQuestion,
  questions,
  quizLength,
  readProgress,
  saveProgress,
  startQuiz,
  storageKey,
} from "../lib/quiz";

const emit = defineEmits<{ lesson: [id: string] }>();
const initial = (() => {
  try {
    return readProgress(window.localStorage);
  } catch {
    return {
      progress: emptyProgress(),
      warning: "Browser storage is unavailable. Progress lasts for this visit.",
    };
  }
})();
const progress = ref(initial.progress);
const warning = ref(initial.warning);
const savedParticipant = (() => {
  try {
    return readParticipant(window.localStorage, false);
  } catch {
    return null;
  }
})();
const participant = ref<Participant | null>(
  isEndpointConfigured() && !savedParticipant?.remoteConsent
    ? null
    : savedParticipant,
);
const previousEmail = ref(savedParticipant?.email ?? "");
// Existing anonymous rounds and rounds for another email cannot be relabeled.
if (
  participant.value &&
  progress.value.session &&
  (progress.value.session.participantEmail !== participant.value.email ||
    progress.value.session.remoteConsent !== participant.value.remoteConsent)
)
  progress.value.session = null;
const choice = ref<number | null>(null);
const resetting = ref(false);
watch(
  progress,
  (p) => {
    try {
      if (!saveProgress(window.localStorage, p))
        warning.value =
          "Progress could not be saved. You can keep practicing in this tab.";
    } catch {
      warning.value =
        "Browser storage is unavailable. Progress lasts for this visit.";
    }
  },
  { deep: true },
);
const session = computed(() => progress.value.session);
const question = computed(() =>
  session.value
    ? byId.get(session.value.ids[session.value.index] ?? "")
    : undefined,
);
const answered = computed(() =>
  question.value ? session.value?.answers[question.value.id] : undefined,
);
const attemptedCount = computed(
  () =>
    questions.filter((q) => currentAttempts(progress.value, q).length).length,
);
const latestCount = computed(
  () => questions.filter((q) => latestCorrect(progress.value, q)).length,
);
const masteredCount = computed(
  () => questions.filter((q) => mastered(progress.value, q)).length,
);
const score = computed(
  () =>
    session.value?.ids.filter(
      (id) => session.value!.answers[id] === byId.get(id)!.correctIndex,
    ).length ?? 0,
);
const completed = computed(
  () => session.value && session.value.index === session.value.ids.length,
);
const topic = (id: string) => lessons.find((l) => l.id === id)?.title ?? id;
function focusQuestion() {
  nextTick(() => document.getElementById("question-title")?.focus());
}
const starting = ref(false);
const poolSize = ref(questions.length);
let poolPromise: ReturnType<typeof receiverQuestionPool> | undefined;
function getPool() {
  return (poolPromise ??= receiverQuestionPool());
}
async function start() {
  if (!participant.value || starting.value) return;
  const email = participant.value.email;
  starting.value = true;
  try {
    const pool = await getPool();
    poolSize.value = pool.length;
    if (!participant.value || participant.value.email !== email) return;
    const next = startQuiz(progress.value, Math.random, pool);
    progress.value = {
      ...next,
      session: bindParticipant(next.session!, participant.value),
    };
    choice.value = null;
    focusQuestion();
  } finally {
    starting.value = false;
  }
}

function registerParticipant(person: Participant) {
  participant.value = person;
  previousEmail.value = person.email;
  try {
    if (!saveParticipant(window.localStorage, person))
      warning.value = "Email could not be saved. You can continue in this tab.";
  } catch {
    warning.value = "Email could not be saved. You can continue in this tab.";
  }
  const current = progress.value.session;
  if (
    current?.participantEmail === person.email &&
    current.remoteConsent === person.remoteConsent
  )
    return;
  progress.value = { ...progress.value, session: null };
  start();
}
function changeEmail() {
  previousEmail.value = participant.value?.email ?? "";
  participant.value = null;
  choice.value = null;
  try {
    window.localStorage.removeItem(participantKey);
  } catch {
    warning.value = "The saved email could not be cleared on this browser.";
  }
}
const inFlight = new Set<string>();
async function deliverResult() {
  const round = session.value,
    person = participant.value;
  if (
    !round ||
    !completed.value ||
    !person ||
    round.participantEmail !== person.email ||
    inFlight.has(round.sessionId)
  )
    return;
  if (!isEndpointConfigured()) {
    progress.value = {
      ...progress.value,
      session: {
        ...round,
        deliveryStatus: "unavailable",
        deliveryMessage:
          "Remote result collection is not connected in this build.",
      },
    };
    return;
  }
  inFlight.add(round.sessionId);
  progress.value = {
    ...progress.value,
    session: {
      ...round,
      deliveryStatus: "sending",
      deliveryMessage: "Waiting for the results receiver…",
    },
  };
  try {
    const pool = await getPool();
    if (round.ids.some((id) => !pool.some((q) => q.id === id)))
      throw new Error(
        "Result collection is temporarily unavailable for this round. Your answers are saved locally.",
      );
    const payload = buildResultPayload(
      round,
      person,
      pool.filter((q) => mastered(progress.value, q)).length,
      window.location.href,
    );
    const delivery = await submitResult(payload);
    if (progress.value.session?.sessionId !== round.sessionId) return;
    progress.value = {
      ...progress.value,
      session: {
        ...progress.value.session,
        deliveryStatus: delivery.status,
        deliveryMessage: delivery.message,
        deliveryRequestId: delivery.requestId,
        ...(delivery.status === "sent"
          ? { deliveryConfirmedAt: new Date().toISOString() }
          : {}),
      },
    };
  } catch (error) {
    if (progress.value.session?.sessionId === round.sessionId)
      progress.value = {
        ...progress.value,
        session: {
          ...progress.value.session,
          deliveryStatus: "failed",
          deliveryMessage:
            error instanceof Error
              ? error.message
              : "The result could not be submitted.",
        },
      };
  } finally {
    inFlight.delete(round.sessionId);
  }
}
watch(
  () =>
    [
      session.value?.sessionId,
      completed.value,
      participant.value?.email,
    ] as const,
  () => {
    if (
      completed.value &&
      participant.value &&
      session.value &&
      !session.value.deliveryStatus
    )
      void deliverResult();
  },
  { immediate: true },
);
function submit() {
  if (choice.value !== null)
    progress.value = answerQuiz(progress.value, choice.value);
}
function next() {
  progress.value = nextQuestion(progress.value);
  choice.value = null;
  focusQuestion();
}
function reset() {
  progress.value = emptyProgress();
  choice.value = null;
  resetting.value = false;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    warning.value =
      "Stored progress could not be removed. Progress is cleared for this visit.";
  }
}
function exportResult() {
  if (session.value && completed.value)
    downloadQuizResult(session.value, score.value);
}
</script>

<template>
  <section class="page-heading">
    <span class="eyebrow">PRACTICE / ISA-101</span>
    <h1>Put good design into practice.</h1>
    <p>
      Fifteen questions per round, from a bank of {{ questions.length }}. Every
      answer includes an explanation and a source clause.
    </p>
  </section>
  <div class="stats-row">
    <div class="stat">
      <strong>{{ attemptedCount }} / {{ questions.length }}</strong
      ><span>Questions attempted</span>
    </div>
    <div class="stat">
      <strong>{{ latestCount }} / {{ questions.length }}</strong
      ><span>Latest answer correct</span>
    </div>
    <div class="stat">
      <strong>{{ masteredCount }} / {{ questions.length }}</strong
      ><span>Correct at least once</span>
    </div>
  </div>
  <p class="muted">
    New questions come first, then missed questions, then prior correct answers.
    A missed review answer returns to practice. Answers and your current round
    save on this browser. Practice scores are not certification.
  </p>
  <p v-if="poolSize < questions.length" class="notice">
    Practice currently draws from {{ poolSize }} questions.
  </p>
  <p v-if="starting" role="status">Preparing your practice round…</p>
  <p v-if="warning" role="status" class="notice">{{ warning }}</p>
  <div v-if="participant" class="participant-summary">
    <span
      >Quiz participant: <strong>{{ participant.email }}</strong></span
    ><button class="text-button" @click="changeEmail">Change email</button>
  </div>
  <QuizParticipantForm
    v-if="!participant"
    :initial-email="previousEmail"
    @register="registerParticipant"
  />
  <section v-else-if="!session" class="panel quiz-intro">
    <h2>Ready when you are.</h2>
    <p>
      Practice the lifecycle, display hierarchy, visual design, information
      context, interaction, performance, and validation.
    </p>
    <button class="primary" :disabled="starting" @click="start">
      Start a 15-question round
    </button>
  </section>
  <section
    v-else-if="question"
    class="panel question-card"
    aria-labelledby="question-title"
  >
    <div class="section-top">
      <span class="eyebrow"
        >QUESTION {{ session.index + 1 }} OF {{ session.ids.length }}</span
      ><span class="tag">{{ question.difficulty }}</span>
    </div>
    <progress
      :value="session.index"
      :max="session.ids.length"
      aria-label="Questions completed"
    />
    <p class="muted">{{ topic(question.topic) }}</p>
    <h2 id="question-title" tabindex="-1">{{ question.prompt }}</h2>
    <form @submit.prevent="submit">
      <fieldset :disabled="answered !== undefined">
        <legend class="sr-only">Choose one answer</legend>
        <label
          v-for="(option, i) in question.options"
          :key="i"
          class="answer"
          :class="{
            selected: (answered ?? choice) === i,
            correct: answered !== undefined && i === question.correctIndex,
            incorrect: answered === i && i !== question.correctIndex,
          }"
        >
          <input
            v-model="choice"
            type="radio"
            name="answer"
            :value="i"
            :checked="(answered ?? choice) === i"
          />
          <span>{{ option }}</span
          ><strong v-if="answered !== undefined && i === question.correctIndex"
            >Correct answer</strong
          ><strong v-else-if="answered === i">Your answer</strong>
        </label>
      </fieldset>
      <button
        v-if="answered === undefined"
        class="primary"
        :disabled="choice === null"
        type="submit"
      >
        Check answer
      </button>
    </form>
    <div v-if="answered !== undefined" class="feedback" role="status">
      <h3>
        {{
          answered === question.correctIndex
            ? "Correct."
            : "Review this principle."
        }}
      </h3>
      <p>{{ question.explanation }}</p>
      <p class="source">
        {{ standardTitle }} · § {{ question.clause }} · {{ question.basis }}
      </p>
      <div class="actions">
        <button class="primary" @click="next">
          {{
            session.index === session.ids.length - 1
              ? "See results"
              : "Next question"
          }}</button
        ><button class="text-button" @click="emit('lesson', question.topic)">
          Review the lesson
        </button>
      </div>
    </div>
  </section>
  <section v-else-if="completed" class="panel results">
    <span class="eyebrow">ROUND COMPLETE</span>
    <h2>{{ score }} / {{ quizLength }} correct</h2>
    <p>
      You have answered {{ masteredCount }} of {{ questions.length }} questions
      correctly at least once at their current revision.
    </p>
    <div class="notice quiz-delivery" role="status">
      <p v-if="session.deliveryStatus === 'sent'">
        Results storage confirmed for {{ session.participantEmail }}.
      </p>
      <p v-else-if="session.deliveryStatus === 'failed'">
        Results are saved in this browser, but remote storage was not confirmed.
      </p>
      <p v-else-if="session.deliveryStatus === 'unavailable'">
        Results are saved in this browser. Remote collection is not connected
        here.
      </p>
      <p v-else>Sending results and waiting for confirmation…</p>
      <p>{{ session.deliveryMessage }}</p>
      <p v-if="session.deliveryRequestId" class="source">
        Receiver request: {{ session.deliveryRequestId }}
      </p>
      <button v-if="session.deliveryStatus === 'failed'" @click="deliverResult">
        Retry result submission
      </button>
    </div>
    <div class="actions">
      <button class="primary" :disabled="starting" @click="start">
        Start another round</button
      ><button @click="exportResult">Download result</button>
    </div>
    <h3>Review this round</h3>
    <details v-for="id in session.ids" :key="id">
      <summary>
        {{
          session.answers[id] === byId.get(id)!.correctIndex
            ? "Correct"
            : "Review"
        }}
        · {{ byId.get(id)!.prompt }}
      </summary>
      <p>Your answer: {{ byId.get(id)!.options[session.answers[id]!] }}</p>
      <p>
        <strong>Correct answer:</strong>
        {{ byId.get(id)!.options[byId.get(id)!.correctIndex] }}
      </p>
      <p>{{ byId.get(id)!.explanation }}</p>
      <p class="source">
        § {{ byId.get(id)!.clause }} · {{ byId.get(id)!.basis }}
      </p>
      <button class="text-button" @click="emit('lesson', byId.get(id)!.topic)">
        Review lesson
      </button>
    </details>
  </section>
  <div class="reset-area">
    <button v-if="!resetting" class="text-button" @click="resetting = true">
      Reset quiz progress
    </button>
    <div v-else class="notice">
      <p>Clear all saved quiz answers and the current round on this browser?</p>
      <div class="actions">
        <button class="danger-button" @click="reset">Clear quiz progress</button
        ><button @click="resetting = false">Keep progress</button>
      </div>
    </div>
  </div>
</template>
