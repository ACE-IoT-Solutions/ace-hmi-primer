import { byId, quizLength, type Session } from "./quiz";
import { standardTitle } from "../data/lessons";
export function downloadQuizResult(session: Session, score: number) {
  const result = {
    title: "ACE HMI Primer practice result",
    standard: standardTitle,
    exportedAt: new Date().toISOString(),
    score: score,
    total: quizLength,
    sessionId: session.sessionId,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    questions: session.ids.map((id) => {
      const q = byId.get(id)!;
      return {
        id,
        revision: q.revision,
        prompt: q.prompt,
        selectedAnswer: q.options[session.answers[id]!],
        correctAnswer: q.options[q.correctIndex],
        explanation: q.explanation,
        clause: q.clause,
      };
    }),
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "hmi-practice-result.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
