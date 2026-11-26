/**
 * @OnlyCurrentDoc
 * HMI Primer receiver, bound directly to the destination spreadsheet.
 */

// BEGIN GENERATED HMI QUIZ BANK
// Generated from src/data/questions.json by npm run quiz:receiver.
// Embedded so Code.gs is the only script file needed by the receiver.
const HMI_QUIZ_BANK_VERSION = 1;
const HMI_QUIZ_BANK = Object.freeze({
  "HMI-001": {
    "revision": 1,
    "correctIndex": 1
  },
  "HMI-002": {
    "revision": 1,
    "correctIndex": 3
  },
  "HMI-003": {
    "revision": 1,
    "correctIndex": 0
  },
  "HMI-004": {
    "revision": 1,
    "correctIndex": 2
  },
  "HMI-005": {
    "revision": 1,
    "correctIndex": 1
  },
  "HMI-006": {
    "revision": 1,
    "correctIndex": 3
  },
  "HMI-007": {
    "revision": 1,
    "correctIndex": 0
  },
  "HMI-008": {
    "revision": 1,
    "correctIndex": 2
  },
  "HMI-009": {
    "revision": 1,
    "correctIndex": 1
  },
  "HMI-010": {
    "revision": 1,
    "correctIndex": 3
  },
  "HMI-011": {
    "revision": 1,
    "correctIndex": 0
  },
  "HMI-012": {
    "revision": 1,
    "correctIndex": 2
  },
  "HMI-013": {
    "revision": 1,
    "correctIndex": 1
  },
  "HMI-014": {
    "revision": 1,
    "correctIndex": 3
  },
  "HMI-015": {
    "revision": 1,
    "correctIndex": 0
  },
  "HMI-016": {
    "revision": 1,
    "correctIndex": 2
  },
  "HMI-017": {
    "revision": 1,
    "correctIndex": 1
  },
  "HMI-018": {
    "revision": 1,
    "correctIndex": 3
  },
  "HMI-019": {
    "revision": 1,
    "correctIndex": 0
  },
  "HMI-020": {
    "revision": 1,
    "correctIndex": 2
  },
  "HMI-021": {
    "revision": 1,
    "correctIndex": 1
  },
  "HMI-022": {
    "revision": 1,
    "correctIndex": 3
  },
  "HMI-023": {
    "revision": 1,
    "correctIndex": 0
  },
  "HMI-024": {
    "revision": 1,
    "correctIndex": 2
  },
  "HMI-025": {
    "revision": 1,
    "correctIndex": 1
  },
  "HMI-026": {
    "revision": 1,
    "correctIndex": 3
  },
  "HMI-027": {
    "revision": 1,
    "correctIndex": 0
  },
  "HMI-028": {
    "revision": 1,
    "correctIndex": 2
  },
  "HMI-029": {
    "revision": 1,
    "correctIndex": 1
  },
  "HMI-030": {
    "revision": 1,
    "correctIndex": 3
  },
  "HMI-031": {
    "revision": 1,
    "correctIndex": 0
  },
  "HMI-032": {
    "revision": 1,
    "correctIndex": 2
  },
  "HMI-033": {
    "revision": 1,
    "correctIndex": 1
  },
  "HMI-034": {
    "revision": 1,
    "correctIndex": 3
  },
  "HMI-035": {
    "revision": 1,
    "correctIndex": 0
  },
  "HMI-036": {
    "revision": 1,
    "correctIndex": 2
  },
  "HMI-037": {
    "revision": 1,
    "correctIndex": 1
  },
  "HMI-038": {
    "revision": 1,
    "correctIndex": 3
  },
  "HMI-039": {
    "revision": 1,
    "correctIndex": 0
  },
  "HMI-040": {
    "revision": 1,
    "correctIndex": 2
  }
});
// END GENERATED HMI QUIZ BANK

const QUIZ_RECEIVER_VERSION = '2026-11-25.2';
const QUIZ_RESULTS_SHEET_NAME = 'HMI Quiz Results';
const QUIZ_RESULTS_HEADERS = Object.freeze([
  'Submitted At',
  'Session ID',
  'Email',
  'Score',
  'Total',
  'Percentage',
  'Mastered Total',
  'Started At',
  'Completed At',
  'Bank Version',
  'Question IDs',
  'Answers',
  'Incorrect IDs',
  'Source URL',
  'Pipedrive Person ID',
  'Pipedrive Status',
  'Pipedrive Error',
  'Consent At',
  'Privacy Policy URL',
  'App ID',
  'Question Revisions'
]);

/** Run once from the Apps Script editor while this project is bound to the results spreadsheet. */
function setupQuizResults() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Bind this Apps Script project to the Google Sheet before running setup.');
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('SHEET_NAME')) properties.setProperty('SHEET_NAME', QUIZ_RESULTS_SHEET_NAME);
  ensureResultsSheet_(spreadsheet);
  return `Quiz results will be stored in ${spreadsheet.getName()}.`;
}

function doGet() {
  try {
    const spreadsheet = getResultsSpreadsheet_();
    const name = PropertiesService.getScriptProperties().getProperty('SHEET_NAME') || QUIZ_RESULTS_SHEET_NAME;
    const sheet = spreadsheet.getSheetByName(name);
    if (!sheet) throw new Error('Results tab is missing. Run setupQuizResults.');
    checkHeaders_(sheet);
    return jsonResponse_({ ok: true, service: 'ACE HMI Primer quiz results', storage: 'bound_workbook', receiverVersion: QUIZ_RECEIVER_VERSION,
      bankVersion: HMI_QUIZ_BANK_VERSION, questionCount: Object.keys(HMI_QUIZ_BANK).length });
  } catch (error) {
    return jsonResponse_({ ok: false, service: 'ACE HMI Primer quiz results', error: String(error.message || error), receiverVersion: QUIZ_RECEIVER_VERSION });
  }
}

function doPost(event) {
  const requestId = Utilities.getUuid();
  let sessionId = '';
  try {
    const raw = event && event.parameter && event.parameter.payload;
    if (typeof raw !== 'string' || raw.length > 50000 || !raw.length) throw new Error('Missing or oversized quiz payload.');
    const payload = JSON.parse(raw);
    validateQuizPayload_(payload);
    sessionId = payload.sessionId;
    const stored = appendQuizResult_(payload);
    if (stored.duplicate) {
      logEvent_('duplicate', requestId, sessionId);
      return jsonResponse_({ ok: true, duplicate: true, sessionId, requestId });
    }
    logEvent_('stored', requestId, sessionId);
    let pipedriveResult;
    try { pipedriveResult = syncPipedrive_(payload); }
    catch (error) {
      // Do not log credentials, request URLs, contact data or raw API responses.
      pipedriveResult = { personId: '', status: 'failed', error: 'Pipedrive sync failed; check server-side configuration and API access.' };
      logEvent_('pipedrive_failed', requestId, sessionId);
    }
    try {
      updatePipedriveResult_(stored.sheet, stored.row, pipedriveResult);
      SpreadsheetApp.flush();
    } catch (error) { logEvent_('pipedrive_status_write_failed', requestId, sessionId); }
    return jsonResponse_({ ok: true, sessionId, requestId, pipedriveStatus: pipedriveResult.status });
  } catch (error) {
    logEvent_('failed', requestId, sessionId);
    return jsonResponse_({ ok: false, error: String(error.message || error), requestId });
  }
}
function logEvent_(event, requestId, sessionId) {
  console.log(JSON.stringify({ event, requestId, sessionId, receiverVersion: QUIZ_RECEIVER_VERSION }));
}

function validateQuizPayload_(payload) {
  if (!payload || payload.version !== 1 || payload.appId !== 'ace-hmi-primer') throw new Error('Unsupported quiz result.');
  if (payload.website) throw new Error('Spam check failed.');
  if (typeof payload.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.email.length > 254) throw new Error('Invalid email.');
  if (!/^[A-Za-z0-9-]{8,100}$/.test(String(payload.sessionId || ''))) throw new Error('Invalid session ID.');
  if (!Array.isArray(payload.questionIds) || payload.questionIds.length !== 15 || new Set(payload.questionIds).size !== 15 ||
      !payload.questionIds.every(id => /^HMI-\d{3}$/.test(id) && Number(id.slice(4)) >= 1 && Number(id.slice(4)) <= 40)) throw new Error('Expected 15 distinct HMI question IDs.');
  if (!payload.answers || typeof payload.answers !== 'object' || Array.isArray(payload.answers) ||
      Object.keys(payload.answers).length !== 15 || !payload.questionIds.every(id => Number.isInteger(payload.answers[id]) && payload.answers[id] >= 0 && payload.answers[id] < 4)) throw new Error('Invalid quiz answers.');
  if (payload.total !== 15 || !Number.isInteger(payload.score) || payload.score < 0 || payload.score > 15) throw new Error('Invalid quiz score.');
  if (!Number.isFinite(payload.percentage) || Math.abs(payload.percentage - payload.score / 15 * 100) > 0.11) throw new Error('Invalid percentage.');
  if (!Number.isInteger(payload.masteredTotal) || payload.masteredTotal < 0 || payload.masteredTotal > 40) throw new Error('Invalid mastery count.');
  if (!Number.isInteger(payload.bankVersion) || payload.bankVersion < 1 || !Array.isArray(payload.questionRevisions) ||
      payload.questionRevisions.length !== 15 || !payload.questionRevisions.every(n => Number.isInteger(n) && n > 0)) throw new Error('Invalid bank revision.');
  if (!Array.isArray(payload.incorrectQuestionIds) || new Set(payload.incorrectQuestionIds).size !== payload.incorrectQuestionIds.length ||
      payload.incorrectQuestionIds.length !== 15 - payload.score || !payload.incorrectQuestionIds.every(id => payload.questionIds.includes(id))) throw new Error('Invalid missed-question list.');
  const incorrect = [];
  payload.questionIds.forEach((id, index) => {
    const question = HMI_QUIZ_BANK[id];
    if (!question || question.revision !== payload.questionRevisions[index]) throw new Error('Question revision does not match the receiver bank.');
    if (payload.answers[id] !== question.correctIndex) incorrect.push(id);
  });
  if (payload.bankVersion !== HMI_QUIZ_BANK_VERSION || payload.score !== 15 - incorrect.length ||
      incorrect.some(id => !payload.incorrectQuestionIds.includes(id))) throw new Error('Score does not match the answers.');
  ['consentAt', 'startedAt', 'completedAt'].forEach(key => {
    if (typeof payload[key] !== 'string' || payload[key].length > 100 || !Number.isFinite(Date.parse(payload[key]))) throw new Error('Invalid ' + key);
  });
  if (Date.parse(payload.startedAt) > Date.parse(payload.completedAt) || Date.parse(payload.consentAt) > Date.parse(payload.completedAt)) throw new Error('Invalid event order.');
  if (payload.privacyPolicyUrl !== 'https://www.privacypolicyonline.com/live.php?token=IuZqxCYZLiM2psa7Bf3mOhJ1tESPxPQU') throw new Error('Missing privacy policy consent.');
  if (typeof payload.sourceUrl !== 'string' || payload.sourceUrl.length > 2000 || !/^https?:\/\/[^\s]+$/.test(payload.sourceUrl)) throw new Error('Invalid source URL.');
}

function appendQuizResult_(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = getResultsSpreadsheet_();
    const sheet = ensureResultsSheet_(spreadsheet);
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existing = sheet.getRange(2, 2, lastRow - 1, 1)
        .createTextFinder(payload.sessionId)
        .matchEntireCell(true)
        .findNext();
      if (existing) return { duplicate: true, sheet, row: existing.getRow() };
    }

    sheet.appendRow([
      new Date(),
      payload.sessionId,
      sheetText_(String(payload.email).toLowerCase()),
      payload.score,
      payload.total,
      payload.percentage,
      payload.masteredTotal,
      payload.startedAt,
      payload.completedAt,
      payload.bankVersion,
      JSON.stringify(payload.questionIds),
      JSON.stringify(payload.answers),
      JSON.stringify(payload.incorrectQuestionIds || []),
      payload.sourceUrl || '',
      '',
      'pending',
      '',
      payload.consentAt,
      payload.privacyPolicyUrl,
      payload.appId,
      JSON.stringify(payload.questionRevisions)
    ]);
    SpreadsheetApp.flush();
    return { duplicate: false, sheet, row: sheet.getLastRow() };
  } finally {
    lock.releaseLock();
  }
}

function getResultsSpreadsheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('No bound workbook is available. Open the destination Sheet, choose Extensions > Apps Script, and run setupQuizResults.');
  return spreadsheet;
}

/** Editor-only diagnostic. Reads the bound workbook; does not write or contact Pipedrive. */
function diagnoseQuizResults() {
  const spreadsheet = getResultsSpreadsheet_();
  const name = PropertiesService.getScriptProperties().getProperty('SHEET_NAME') || QUIZ_RESULTS_SHEET_NAME;
  const sheet = spreadsheet.getSheetByName(name);
  const report = { receiverVersion: QUIZ_RECEIVER_VERSION, spreadsheetUrl: spreadsheet.getUrl(),
    resultsTab: name, exists: Boolean(sheet), resultRows: sheet ? Math.max(0, sheet.getLastRow() - 1) : 0 };
  console.log(JSON.stringify(report));
  return report;
}

function ensureResultsSheet_(spreadsheet) {
  const sheetName = PropertiesService.getScriptProperties().getProperty('SHEET_NAME') || QUIZ_RESULTS_SHEET_NAME;
  const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, QUIZ_RESULTS_HEADERS.length).setValues([QUIZ_RESULTS_HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, QUIZ_RESULTS_HEADERS.length).setFontWeight('bold');
  }
  checkHeaders_(sheet);
  return sheet;
}
function checkHeaders_(sheet) {
  const actual = sheet.getRange(1, 1, 1, QUIZ_RESULTS_HEADERS.length).getValues()[0];
  if (QUIZ_RESULTS_HEADERS.some((header, i) => actual[i] !== header)) throw new Error('Results tab headers do not match. Select a dedicated HMI results tab with SHEET_NAME.');
}

function syncPipedrive_(payload) {
  const properties = PropertiesService.getScriptProperties();
  const apiToken = properties.getProperty('PIPEDRIVE_API_TOKEN');
  const companyDomain = normalizePipedriveDomain_(properties.getProperty('PIPEDRIVE_COMPANY_DOMAIN'));
  if (!apiToken || !companyDomain) return { personId: '', status: 'not_configured', error: '' };

  const search = pipedriveRequest_(companyDomain, apiToken, '/api/v2/persons/search', 'get', null, {
    term: payload.email,
    fields: 'email',
    exact_match: 'true',
    limit: '1'
  });
  const firstResult = search.data && search.data.items && search.data.items[0];
  let personId = firstResult && (firstResult.item ? firstResult.item.id : firstResult.id);
  let status = 'matched';

  if (!personId) {
    const created = pipedriveRequest_(companyDomain, apiToken, '/api/v2/persons', 'post', {
      name: payload.email,
      emails: [{ value: payload.email, primary: true, label: 'work' }]
    });
    personId = created.data && created.data.id;
    status = 'created';
  }
  if (!personId) throw new Error('Pipedrive did not return a person ID.');

  const noteContent = [
    '<strong>ACE HMI Primer competency quiz</strong>',
    `Score: ${Number(payload.score)} / ${Number(payload.total)} (${Number(payload.percentage)}%)`,
    `Completed: ${escapeHtml_(payload.completedAt)}`,
    `Mastered total: ${Number(payload.masteredTotal)}`,
    `Session: ${escapeHtml_(payload.sessionId)}`,
    `Incorrect question IDs: ${escapeHtml_((payload.incorrectQuestionIds || []).join(', ') || 'None')}`
  ].join('<br>');
  pipedriveRequest_(companyDomain, apiToken, '/api/v1/notes', 'post', {
    person_id: Number(personId),
    content: noteContent
  });
  return { personId, status: `${status}_and_noted`, error: '' };
}

function pipedriveRequest_(companyDomain, apiToken, apiPath, method, payload, query) {
  const parameters = Object.assign({}, query || {});
  const queryString = Object.keys(parameters)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
    .join('&');
  const options = {
    method,
    contentType: 'application/json',
    headers: { 'x-api-token': apiToken },
    muteHttpExceptions: true
  };
  if (payload) options.payload = JSON.stringify(payload);
  const response = UrlFetchApp.fetch(`https://${companyDomain}.pipedrive.com${apiPath}?${queryString}`, options);
  const statusCode = response.getResponseCode();
  const responseBody = response.getContentText();
  const parsed = responseBody ? JSON.parse(responseBody) : {};
  if (statusCode < 200 || statusCode >= 300 || parsed.success === false) {
    throw new Error(`Pipedrive ${method.toUpperCase()} ${apiPath} failed (${statusCode}).`);
  }
  return parsed;
}

function normalizePipedriveDomain_(value) {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\.pipedrive\.com.*$/, '')
    .replace(/[^a-zA-Z0-9-]/g, '');
}

function updatePipedriveResult_(sheet, row, result) {
  sheet.getRange(row, 15, 1, 3).setValues([[
    result.personId || '',
    result.status || 'failed',
    sheetText_(result.error || '')
  ]]);
}

function sheetText_(value) {
  const text = String(value);
  return /^\s*[=+\-@]/.test(text) ? "'" + text : text;
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
