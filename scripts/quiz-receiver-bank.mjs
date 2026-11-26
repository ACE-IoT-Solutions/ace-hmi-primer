import fs from "node:fs";
const questions = JSON.parse(
  fs.readFileSync(
    new URL("../src/data/questions.json", import.meta.url),
    "utf8",
  ),
);
const bank = Object.fromEntries(
  questions.map((q) => [
    q.id,
    { revision: q.revision, correctIndex: q.correctIndex },
  ]),
);
const destination = new URL(
  "../integrations/google-apps-script/Code.gs",
  import.meta.url,
);
const source = fs.readFileSync(destination, "utf8");
const startMarker = "// BEGIN GENERATED HMI QUIZ BANK";
const endMarker = "// END GENERATED HMI QUIZ BANK";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker);
if (
  start < 0 ||
  end < start ||
  source.indexOf(startMarker, start + 1) >= 0 ||
  source.indexOf(endMarker, end + 1) >= 0
)
  throw new Error(
    "Code.gs must contain exactly one generated question-bank section.",
  );
const block = `${startMarker}\n// Generated from src/data/questions.json by npm run quiz:receiver.\n// Embedded so Code.gs is the only script file needed by the receiver.\nconst HMI_QUIZ_BANK_VERSION = ${Math.max(...questions.map((q) => q.revision))};\nconst HMI_QUIZ_BANK = Object.freeze(${JSON.stringify(bank, null, 2)});\n${endMarker}`;
const content =
  source.slice(0, start) + block + source.slice(end + endMarker.length);
if (process.argv.includes("--check")) {
  if (source !== content)
    throw new Error(
      "Receiver bank is stale. Run npm run quiz:receiver and update the Apps Script deployment.",
    );
} else fs.writeFileSync(destination, content);
console.log(
  `${process.argv.includes("--check") ? "Checked" : "Embedded"} receiver metadata for ${questions.length} questions in Code.gs.`,
);
