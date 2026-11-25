import bank from "../data/questions.json" with { type: "json" };

export interface Question {
  id: string;
  revision: number;
  topic: string;
  difficulty: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  clause: string;
  basis: string;
}
export const questions: readonly Question[] = bank;
export const quizLength = 15;
export const storageKey = "ace-hmi-quiz-v1";
export const byId = new Map(questions.map((q) => [q.id, q]));
export interface Attempt {
  revision: number;
  choice: number;
  at: string;
}
export interface Session {
  sessionId: string;
  startedAt: string;
  completedAt?: string;
  participantEmail?: string;
  consentAt?: string;
  remoteConsent?: boolean;
  deliveryStatus?: "sending" | "sent" | "unavailable" | "failed";
  deliveryMessage?: string;
  deliveryRequestId?: string;
  deliveryConfirmedAt?: string;
  ids: string[];
  revisions: number[];
  answers: Record<string, number>;
  index: number;
}
export function createSessionId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `hmi-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`
  );
}
export interface Progress {
  version: 1;
  history: Record<string, Attempt[]>;
  session: Session | null;
}
export const emptyProgress = (): Progress => ({
  version: 1,
  history: {},
  session: null,
});
export const currentAttempts = (p: Progress, q: Question) =>
  (p.history[q.id] ?? []).filter((a) => a.revision === q.revision);
export const latestCorrect = (p: Progress, q: Question) =>
  currentAttempts(p, q).at(-1)?.choice === q.correctIndex;
export const mastered = (p: Progress, q: Question) =>
  currentAttempts(p, q).some((a) => a.choice === q.correctIndex);

function shuffle<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
export function selectQuestions(p: Progress, random = Math.random): string[] {
  const unseen = questions.filter((q) => !currentAttempts(p, q).length);
  const missed = questions.filter(
    (q) => currentAttempts(p, q).length && !latestCorrect(p, q),
  );
  const correct = questions.filter((q) => latestCorrect(p, q));
  return [
    ...shuffle(unseen, random),
    ...shuffle(missed, random),
    ...shuffle(correct, random),
  ]
    .slice(0, quizLength)
    .map((q) => q.id);
}
export function startQuiz(p: Progress, random = Math.random): Progress {
  if (p.session && p.session.index < p.session.ids.length) return p;
  const ids = selectQuestions(p, random);
  return {
    ...p,
    session: {
      sessionId: createSessionId(),
      startedAt: new Date().toISOString(),
      ids,
      revisions: ids.map((id) => byId.get(id)!.revision),
      answers: {},
      index: 0,
    },
  };
}
export function answerQuiz(p: Progress, choice: number): Progress {
  const s = p.session;
  const q = s ? byId.get(s.ids[s.index] ?? "") : undefined;
  if (
    !s ||
    !q ||
    s.answers[q.id] !== undefined ||
    !Number.isInteger(choice) ||
    choice < 0 ||
    choice >= q.options.length
  )
    return p;
  return {
    ...p,
    history: {
      ...p.history,
      [q.id]: [
        ...(p.history[q.id] ?? []),
        { revision: q.revision, choice, at: new Date().toISOString() },
      ],
    },
    session: { ...s, answers: { ...s.answers, [q.id]: choice } },
  };
}
export function nextQuestion(p: Progress): Progress {
  const s = p.session;
  if (!s || s.index >= s.ids.length || s.answers[s.ids[s.index]!] === undefined)
    return p;
  return {
    ...p,
    session: {
      ...s,
      index: s.index + 1,
      ...(s.index + 1 === s.ids.length
        ? { completedAt: new Date().toISOString() }
        : {}),
    },
  };
}

function validChoice(choice: unknown): choice is number {
  return Number.isInteger(choice) && Number(choice) >= 0 && Number(choice) < 4;
}
export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  const data = JSON.parse(raw);
  if (
    data?.version !== 1 ||
    !data.history ||
    typeof data.history !== "object" ||
    Array.isArray(data.history)
  )
    throw new Error("Invalid progress");
  const p = emptyProgress();
  for (const q of questions) {
    if (!Array.isArray(data.history[q.id])) continue;
    p.history[q.id] = data.history[q.id]
      .filter(
        (a: Attempt) =>
          a &&
          a.revision === q.revision &&
          validChoice(a.choice) &&
          typeof a.at === "string" &&
          Number.isFinite(Date.parse(a.at)),
      )
      .map((a: Attempt) => ({
        revision: a.revision,
        choice: a.choice,
        at: a.at,
      }));
  }
  const s = data.session;
  if (
    !s ||
    !Array.isArray(s.ids) ||
    s.ids.length !== quizLength ||
    new Set(s.ids).size !== quizLength ||
    !Array.isArray(s.revisions) ||
    s.revisions.length !== quizLength ||
    !Number.isInteger(s.index) ||
    s.index < 0 ||
    s.index > quizLength ||
    !s.answers ||
    typeof s.answers !== "object" ||
    Array.isArray(s.answers)
  )
    return p;
  const valid = s.ids.every((id: unknown, i: number) => {
    if (
      typeof id !== "string" ||
      !byId.has(id) ||
      s.revisions[i] !== byId.get(id)!.revision
    )
      return false;
    const choice = s.answers[id];
    if (i < s.index) return validChoice(choice);
    if (i === s.index) return choice === undefined || validChoice(choice);
    return choice === undefined;
  });
  if (valid)
    p.session = {
      sessionId:
        typeof s.sessionId === "string" &&
        /^[A-Za-z0-9-]{8,100}$/.test(s.sessionId)
          ? s.sessionId
          : createSessionId(),
      startedAt: validDate(s.startedAt)
        ? s.startedAt
        : new Date().toISOString(),
      ...(s.index === quizLength && validDate(s.completedAt)
        ? { completedAt: s.completedAt }
        : {}),
      ...(typeof s.participantEmail === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.participantEmail) &&
      validDate(s.consentAt)
        ? {
            participantEmail: s.participantEmail.trim().toLowerCase(),
            consentAt: s.consentAt,
            remoteConsent: s.remoteConsent === true,
          }
        : {}),
      ...(["sending", "sent", "failed", "unavailable"].includes(
        s.deliveryStatus,
      )
        ? {
            deliveryStatus:
              s.deliveryStatus === "sending" ||
              (s.deliveryStatus === "sent" && !validDate(s.deliveryConfirmedAt))
                ? "failed"
                : s.deliveryStatus,
            deliveryMessage:
              s.deliveryStatus === "sending"
                ? "Submission was interrupted. Retry to confirm storage."
                : typeof s.deliveryMessage === "string"
                  ? s.deliveryMessage.slice(0, 1000)
                  : "",
            ...(typeof s.deliveryRequestId === "string"
              ? { deliveryRequestId: s.deliveryRequestId.slice(0, 100) }
              : {}),
            ...(validDate(s.deliveryConfirmedAt)
              ? { deliveryConfirmedAt: s.deliveryConfirmedAt }
              : {}),
          }
        : {}),
      ids: [...s.ids],
      revisions: [...s.revisions],
      index: s.index,
      answers: Object.fromEntries(
        s.ids
          .filter((id: string) => s.answers[id] !== undefined)
          .map((id: string) => [id, s.answers[id]]),
      ),
    };
  return p;
}
function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 100 &&
    Number.isFinite(Date.parse(value))
  );
}
export function readProgress(storage: Pick<Storage, "getItem">): {
  progress: Progress;
  warning: string;
} {
  try {
    return {
      progress: parseProgress(storage.getItem(storageKey)),
      warning: "",
    };
  } catch {
    return {
      progress: emptyProgress(),
      warning:
        "Saved quiz data could not be read. You can practice in this tab.",
    };
  }
}
export function saveProgress(
  storage: Pick<Storage, "setItem">,
  progress: Progress,
): boolean {
  try {
    storage.setItem(storageKey, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
