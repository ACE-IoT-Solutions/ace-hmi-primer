import { byId, questions, quizLength, type Session } from "./quiz";

// Shared ACE policy used by BACnet Studio and CDL Explorer.
export const privacyPolicyUrl =
  "https://www.privacypolicyonline.com/live.php?token=IuZqxCYZLiM2psa7Bf3mOhJ1tESPxPQU";
export const participantKey = "ace-hmi-quiz-participant-v1";
export const resultsEndpoint: string =
  import.meta.env?.VITE_QUIZ_RESULTS_ENDPOINT?.trim() ?? "";
export interface Participant {
  version: 1;
  email: string;
  consentAt: string;
  remoteConsent: boolean;
}
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}
export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function isEndpointConfigured(endpoint = resultsEndpoint): boolean {
  return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(
    endpoint,
  );
}
/** Keep the existing core-bank receiver working during an expanded-bank rollout. */
export async function receiverQuestionPool(
  endpoint = resultsEndpoint,
  fetcher: typeof fetch = fetch,
) {
  if (!isEndpointConfigured(endpoint)) return [...questions];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetcher(endpoint, {
      credentials: "omit",
      signal: controller.signal,
    });
    const health = await response.json();
    if (
      response.ok &&
      health?.ok === true &&
      Number.isInteger(health.questionCount) &&
      health.questionCount >= quizLength
    ) {
      const ids = Array.isArray(health.questionIds)
        ? new Set(health.questionIds)
        : null;
      const pool = questions.filter((q) =>
        ids ? ids.has(q.id) : Number(q.id.slice(4)) <= health.questionCount,
      );
      if (pool.length >= quizLength) return pool;
    }
  } catch {
    /* Conservative core-bank fallback preserves compatibility. */
  } finally {
    clearTimeout(timer);
  }
  return questions.filter((q) => Number(q.id.slice(4)) <= 40);
}
export function readParticipant(
  storage: Pick<Storage, "getItem">,
  requireRemoteConsent = isEndpointConfigured(),
): Participant | null {
  try {
    const p = JSON.parse(storage.getItem(participantKey) ?? "null");
    if (
      p?.version !== 1 ||
      typeof p.email !== "string" ||
      !isValidEmail(p.email) ||
      typeof p.consentAt !== "string" ||
      !Number.isFinite(Date.parse(p.consentAt)) ||
      (requireRemoteConsent && p.remoteConsent !== true)
    )
      return null;
    return {
      version: 1,
      email: normalizeEmail(p.email),
      consentAt: p.consentAt,
      remoteConsent: p.remoteConsent === true,
    };
  } catch {
    return null;
  }
}
export function saveParticipant(
  storage: Pick<Storage, "setItem">,
  participant: Participant,
): boolean {
  try {
    storage.setItem(participantKey, JSON.stringify(participant));
    return true;
  } catch {
    return false;
  }
}
export function bindParticipant(
  session: Session,
  participant: Participant,
): Session {
  if (
    session.participantEmail &&
    session.participantEmail !== participant.email
  )
    throw new Error("This round belongs to another participant.");
  if (!session.participantEmail && Object.keys(session.answers).length)
    throw new Error("An existing anonymous round cannot be relabeled.");
  return {
    ...session,
    participantEmail: participant.email,
    consentAt: session.consentAt ?? participant.consentAt,
    remoteConsent: session.remoteConsent ?? participant.remoteConsent,
  };
}
export interface ResultPayload {
  version: 1;
  appId: "ace-hmi-primer";
  sessionId: string;
  email: string;
  consentAt: string;
  startedAt: string;
  completedAt: string;
  score: number;
  total: number;
  percentage: number;
  masteredTotal: number;
  bankVersion: number;
  questionIds: string[];
  questionRevisions: number[];
  answers: Record<string, number>;
  incorrectQuestionIds: string[];
  privacyPolicyUrl: string;
  sourceUrl: string;
  website: string;
}
export function buildResultPayload(
  s: Session,
  participant: Participant,
  masteredTotal: number,
  sourceUrl: string,
): ResultPayload {
  if (
    s.index !== quizLength ||
    s.ids.length !== quizLength ||
    new Set(s.ids).size !== quizLength ||
    !s.completedAt ||
    !Number.isFinite(Date.parse(s.completedAt)) ||
    !Number.isFinite(Date.parse(s.startedAt))
  )
    throw new Error("Cannot submit an incomplete quiz.");
  if (
    s.participantEmail !== normalizeEmail(participant.email) ||
    !isValidEmail(participant.email) ||
    s.remoteConsent !== true ||
    participant.remoteConsent !== true ||
    !s.consentAt ||
    !Number.isFinite(Date.parse(s.consentAt))
  )
    throw new Error("Remote consent does not match this round.");
  if (
    Date.parse(s.startedAt) > Date.parse(s.completedAt) ||
    Date.parse(s.consentAt) > Date.parse(s.completedAt)
  )
    throw new Error("Invalid round event order.");
  if (
    !Number.isInteger(masteredTotal) ||
    masteredTotal < 0 ||
    masteredTotal > questions.length
  )
    throw new Error("Invalid bank progress.");
  for (const [i, id] of s.ids.entries()) {
    const q = byId.get(id);
    if (
      !q ||
      s.revisions[i] !== q.revision ||
      !Number.isInteger(s.answers[id]) ||
      s.answers[id]! < 0 ||
      s.answers[id]! >= 4
    )
      throw new Error("Invalid answer or question revision.");
  }
  const source = new URL(sourceUrl);
  if (!["https:", "http:"].includes(source.protocol))
    throw new Error("Invalid source URL.");
  source.username = "";
  source.password = "";
  source.search = "";
  source.hash = "quiz";
  const incorrectQuestionIds = s.ids.filter(
    (id) => s.answers[id] !== byId.get(id)!.correctIndex,
  );
  const score = quizLength - incorrectQuestionIds.length;
  return {
    version: 1,
    appId: "ace-hmi-primer",
    sessionId: s.sessionId,
    email: normalizeEmail(participant.email),
    consentAt: s.consentAt,
    startedAt: s.startedAt,
    completedAt: s.completedAt,
    score,
    total: quizLength,
    percentage: Number(((score / quizLength) * 100).toFixed(1)),
    masteredTotal,
    bankVersion: Math.max(...questions.map((q) => q.revision)),
    questionIds: [...s.ids],
    questionRevisions: [...s.revisions],
    answers: Object.fromEntries(s.ids.map((id) => [id, s.answers[id]!])),
    incorrectQuestionIds,
    privacyPolicyUrl,
    sourceUrl: source.toString(),
    website: "",
  };
}
export interface Delivery {
  status: "sent" | "unavailable" | "failed";
  message: string;
  requestId?: string;
}
export async function submitResult(
  payload: ResultPayload,
  endpoint = resultsEndpoint,
  fetcher: typeof fetch = fetch,
  timeoutMs = 15000,
): Promise<Delivery> {
  if (!isEndpointConfigured(endpoint))
    return {
      status: "unavailable",
      message: "Remote result collection is not configured in this build.",
    };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Form encoding avoids a JSON preflight. A readable acknowledgement is required.
    const response = await fetcher(endpoint, {
      method: "POST",
      body: new URLSearchParams({ payload: JSON.stringify(payload) }),
      signal: controller.signal,
      credentials: "omit",
    });
    if (response.type === "opaque")
      throw new Error(
        "The receiver response was opaque; storage could not be confirmed.",
      );
    const result = await response.json();
    const requestId =
      typeof result?.requestId === "string"
        ? result.requestId.slice(0, 100)
        : undefined;
    if (
      !response.ok ||
      result?.ok !== true ||
      result.sessionId !== payload.sessionId
    )
      return {
        status: "failed",
        message:
          typeof result?.error === "string"
            ? result.error.slice(0, 1000)
            : "The receiver did not confirm this quiz session.",
        ...(requestId ? { requestId } : {}),
      };
    return {
      status: "sent",
      message: result.duplicate
        ? "This quiz session was already stored."
        : "The receiver confirmed this quiz was stored.",
      ...(requestId ? { requestId } : {}),
    };
  } catch (error) {
    return {
      status: "failed",
      message: controller.signal.aborted
        ? "The receiver timed out. You can retry this same result."
        : `Remote storage was not confirmed. ${error instanceof Error ? error.message : "The response could not be read."}`,
    };
  } finally {
    clearTimeout(timeout);
  }
}
