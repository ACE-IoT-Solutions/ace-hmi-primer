# HMI quiz results: Google Sheets and Pipedrive

This integration follows BACnet Studio and CDL Explorer’s email/consent workflow. The quiz requires a valid-looking email address and explicit privacy-policy acknowledgement before displaying questions. It remembers the participant separately from learning progress. Completed 15-question rounds are sent to this receiver when its URL is configured.

The receiver stores each unique session in a Google Sheet, including the email, consent time, policy URL, question revisions, answers, score, and completion time. If configured, it finds or creates a Pipedrive person by exact email and adds a quiz-result note. It does not subscribe the participant to marketing. Entering an email alone does not create a remote contact; submission happens when a round is completed.

## 1. Install the receiver

1. Open the Google Sheet that should hold the results, then choose **Extensions → Apps Script**.
2. Replace the editor’s `Code.gs` with [Code.gs](Code.gs).
3. Add a script file named `QuestionBank` and paste [QuestionBank.gs](QuestionBank.gs) into it. Google adds the `.gs` extension. This generated file lets the receiver validate question revisions and calculate the score from the submitted answers.
4. In **Project Settings**, enable **Show appsscript.json manifest file in editor**. Replace that manifest with [appsscript.json](appsscript.json).
5. Save all files. Select `setupQuizResults` in the function menu and run it from the editor. Authorize the requested permissions.

Setup uses the directly attached workbook and creates the **HMI Quiz Results** tab with its headers. No spreadsheet ID property is needed. Optional `SHEET_NAME` selects a different tab. Use a dedicated HMI tab: the handler rejects an existing tab whose headers do not match this receiver. Do not replace a BACnet or CDL receiver deployment with this code; create a separate Apps Script deployment, even if its destination tab is in a shared workbook.

**Spreadsheet permission:** the manifest uses `spreadsheets.currentonly`, and `Code.gs` includes `@OnlyCurrentDoc`, matching the two existing attached-sheet integrations. All spreadsheet access uses `SpreadsheetApp.getActiveSpreadsheet()` to work with the directly attached workbook. The script must be created from that Sheet’s **Extensions → Apps Script** menu. The additional `script.external_request` scope supports the optional Pipedrive calls. No all-spreadsheets, Drive, or Gmail scope is requested.

## 2. Optional Pipedrive configuration

Under **Project Settings → Script Properties**, add:

| Property | Value |
| --- | --- |
| `PIPEDRIVE_COMPANY_DOMAIN` | Company subdomain, such as `acme` for `acme.pipedrive.com` |
| `PIPEDRIVE_API_TOKEN` | API token for the intended Pipedrive account |

Keep the token in Script Properties. Do not put it in `.env`, frontend source, a `VITE_` variable, or browser storage. The receiver authenticates using the `x-api-token` request header rather than placing the token in URLs. See [Pipedrive authentication](https://pipedrive.readme.io/docs/core-api-concepts-authentication).

The implementation uses the [v2 Persons search/create endpoints](https://developers.pipedrive.com/docs/api/v1/Persons) and the [v1 Notes endpoint](https://developers.pipedrive.com/docs/api/v1/Notes). Existing contacts are matched by email; absent contacts are created with the email as their name. No other existing person fields are changed.

Without these properties, Sheet storage still works and the Pipedrive Status column shows `not_configured`. A Pipedrive error records `failed` after the Sheet row has been committed. Reposting an already stored session does not create another row or note, and does not retry a previously failed CRM sync. Resolve a failed CRM sync separately using the stored record.

## 3. Deploy the web app

1. Choose **Deploy → New deployment → Web app**.
2. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
3. Deploy a versioned release, authorize it if prompted, and copy the URL ending in `/exec`.
4. Open that URL in a browser. The read-only health response should include:

```json
{
  "ok": true,
  "service": "ACE HMI Primer quiz results",
  "storage": "bound_workbook",
  "receiverVersion": "2026-11-25.1"
}
```

If Google Workspace policy prevents anonymous web apps, this browser integration needs a deployment environment that permits the chosen access setting. A login-only `/exec` URL cannot collect results from anonymous quiz visitors.

The `/exec` URL is a public collection endpoint, not a secret. The handler validates app identity, payload size, consent, 15 distinct HMI IDs, question revisions, answers, calculated score, and timestamps. It rejects the form honeypot. These records remain unproctored practice results; this endpoint does not authenticate ownership of the submitted email address.

## 4. Connect the frontend

For a local test or manual production build:

```sh
cp .env.example .env.local
```

Set this value in `.env.local`:

```dotenv
VITE_QUIZ_RESULTS_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Restart `npm run dev`, or run `npm run build` and publish the new `dist/`. Vite substitutes the URL at startup/build time; changing an environment variable after static assets have been built does not reconfigure those assets. `.env.local` is ignored by source control. The URL must be an HTTPS `script.google.com/macros/s/.../exec` URL; editor `/dev` URLs and arbitrary domains are rejected by the client.

The GitHub Pages workflow reads the repository Actions secret `QUIZ_RESULTS_ENDPOINT` on pushes to `deploy` and passes it to the **build step**:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_QUIZ_RESULTS_ENDPOINT: ${{ secrets.QUIZ_RESULTS_ENDPOINT }}
```

The endpoint is included in the frontend bundle. No Pipedrive credential is included. The `.github/workflows/deploy.yml` workflow follows BACnet Studio’s deployment setup and maps the repository secret to the frontend’s explicit Vite build configuration. Keep the variable empty in builds that should remain browser-local.

## Delivery and participant behavior

- A completed round submits once automatically. A readable JSON response with `ok: true` and the matching session ID is required before the UI reports **Results storage confirmed**.
- The client sends a form-encoded POST without custom headers and follows the ContentService redirect. It does not use `no-cors` or infer storage from an opaque response. [Google documents the ContentService redirect](https://developers.google.com/apps-script/guides/content#redirects).
- Network, CORS, timeout, authentication HTML, and receiver errors remain **unconfirmed**. The browser retains the round and offers **Retry result submission**. Retry uses the same session ID; the receiver deduplicates it under a script lock. A failed acknowledgement can mean the row was stored but the response was lost.
- The request ID shown on a result can be matched to structured Apps Script execution logs. Logs contain session/request IDs and event names, not participant email or raw result payloads.
- Browser-only consent does not authorize future remote collection. If collection is enabled later on the same origin, the gate asks for consent again and starts a fresh round rather than uploading an old local-only result.
- **Change email** removes the saved participant. A different participant gets a fresh round; an existing completed result is not relabeled. **Reset quiz progress** clears learning answers and the current round while retaining the participant.
- The history and mastery counts remain per-browser, as in the reference apps. They are not a cross-device or authenticated per-person transcript.
- Email is collected at the gate but transmitted only with a completed round. Lessons, glossary, design lab, and checklist remain available without the gate.

## Updating and diagnosing the receiver

When questions or revisions change, run:

```sh
npm run quiz:receiver
npm run quiz:receiver:check
```

Replace `QuestionBank.gs` in Apps Script alongside the corresponding frontend update. Replace `Code.gs` or the manifest when those files change. In **Deploy → Manage deployments**, edit the existing deployment and choose **New version → Deploy**. Saving editor files alone does not update a versioned `/exec` deployment. Keeping the deployment preserves its URL.

Run `diagnoseQuizResults` from the editor for a read-only report of the bound workbook URL, tab name, and row count. It writes no records and contacts no CRM. If the destination is correct but public health is outdated, check that the frontend URL points to the deployment you updated. If the bound workbook is unavailable, open Apps Script directly from the destination Sheet and run `setupQuizResults`. The receiver reports an error rather than trying another workbook or requesting broader spreadsheet access.

Automated tests use mocked Sheets, CRM, and HTTP services. No live deployment, result, or contact is created by those tests. Before relying on production collection, verify the public health response, complete one authorized test round from the deployed frontend, and check the Sheet and (if enabled) Pipedrive. The provided deployment’s read-only health response was verified with `ok: true` and `storage: "bound_workbook"`. No live result or CRM contact has been submitted.
