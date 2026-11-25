import fs from "node:fs";
const bank = JSON.parse(
  fs.readFileSync(
    new URL("../src/data/questions.json", import.meta.url),
    "utf8",
  ),
);
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HMI Primer question review</title><style>body{font:16px/1.5 system-ui;margin:2rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:.75rem;vertical-align:top;text-align:left}th{background:#eee}li{margin:.35rem 0}small{display:block}h1{font-size:2rem}</style><h1>ACE HMI Primer · question review</h1><p>${bank.length} original questions based on ANSI/ISA-101.01-2015. Clause references were checked against the supplied licensed edition during authoring. An independent subject-matter review is still recommended before using scores for any formal assessment. Applied building practices are labeled separately from standard guidance and requirements.</p><p>Edit src/data/questions.json; increment revision when the meaning or correct answer changes. Regeneration replaces this file and its CSV companion. The standard itself is not included.</p><table><thead><tr><th>ID / topic</th><th>Question and options</th><th>Answer and rationale</th><th>Source / basis</th></tr></thead><tbody>${bank.map((q) => `<tr><td>${escape(q.id)}<small>Revision ${q.revision} · ${escape(q.topic)} · ${escape(q.difficulty)}</small></td><td>${escape(q.prompt)}<ol type="A">${q.options.map((o) => `<li>${escape(o)}</li>`).join("")}</ol></td><td><strong>${String.fromCharCode(65 + q.correctIndex)}. ${escape(q.options[q.correctIndex])}</strong><p>${escape(q.explanation)}</p></td><td>§ ${escape(q.clause)}<p>${escape(q.basis)}</p></td></tr>`).join("")}</tbody></table></html>\n`;
const columns = [
  "id",
  "revision",
  "topic",
  "difficulty",
  "prompt",
  "optionA",
  "optionB",
  "optionC",
  "optionD",
  "correctAnswer",
  "explanation",
  "clause",
  "basis",
  "reviewNotes",
];
const csvCell = (v) => `"${String(v).replaceAll('"', '""')}"`;
const csv =
  [
    columns,
    ...bank.map((q) => [
      q.id,
      q.revision,
      q.topic,
      q.difficulty,
      q.prompt,
      ...q.options,
      String.fromCharCode(65 + q.correctIndex),
      q.explanation,
      q.clause,
      q.basis,
      "",
    ]),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n") + "\r\n";
fs.mkdirSync(new URL("../docs/", import.meta.url), { recursive: true });
for (const [name, content] of [
  ["question-review.html", html],
  ["question-review.csv", csv],
]) {
  const path = new URL(`../docs/${name}`, import.meta.url);
  if (process.argv.includes("--check")) {
    if (!fs.existsSync(path) || fs.readFileSync(path, "utf8") !== content)
      throw new Error(
        `Review output is stale: ${name}. Run npm run quiz:review.`,
      );
  } else fs.writeFileSync(path, content);
}
console.log(
  `${process.argv.includes("--check") ? "Checked" : "Generated"} review files for ${bank.length} questions.`,
);
