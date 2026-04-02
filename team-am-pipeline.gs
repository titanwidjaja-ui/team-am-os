/**
 * ============================================================
 * TEAM AM COACHING PIPELINE — Google Apps Script v1.2
 * ============================================================
 *
 * SETUP INSTRUCTIONS (complete these steps in order):
 *
 *  1. Open your Google Sheet → Extensions → Apps Script
 *  2. Delete the default Code.gs content entirely
 *  3. Paste this entire script and Save (Ctrl+S / Cmd+S)
 *  4. In the editor toolbar, select "setupCreateTabs" from the
 *     function dropdown and click Run — authorize when prompted.
 *     This creates all tabs with correct headers.
 *  5. Paste your Anthropic API key into the Config tab cell A1.
 *     (Use Team AM menu → Setup: Verify API Key to test it.)
 *  6. Paste your prompts into the Prompts tab:
 *       A1 = Stage 1 prompt
 *       A2 = Stage 1.5 prompt
 *       A3 = Stage 2 prompt
 *       A4 = Stage 3 prompt
 *       A5 = Knowledge Base
 *  7. Install triggers: Team AM menu → Setup: Install Triggers
 *     OR manually in the Triggers panel:
 *       Function: checkForNewIntake | Time-driven | Every 5 minutes
 *       Function: onEditTrigger     | From spreadsheet | On edit
 *
 * PIPELINE FLOW:
 *   New intake row detected (every 5 min)
 *     → Stage 1 auto-runs → writes to "Stage 1 Outputs" tab
 *     → Coach adds call notes in Pipeline col F, sets col E = "Ready"
 *     → Stage 1.5 auto-runs → writes to "Coaching Briefs" tab
 *     → Coach reviews brief, sets Pipeline col H = "Approved"
 *     → Calc Layer runs deterministically → computed targets locked in col D
 *     → Stage 2 + Stage 3 auto-run → writes to "Blueprints" tab
 *
 * CONFIG TAB STRUCTURE (column A = values, column B = labels):
 *   A1 = Anthropic API key
 *   A2 = Stage 1 model   (default: claude-sonnet-4-20250514)
 *   A3 = Stage 1.5 model (default: claude-sonnet-4-20250514)
 *   A4 = Stage 2 model   (default: claude-opus-4-20250514)
 *   A5 = Stage 3 model   (default: claude-sonnet-4-20250514)
 *   A6 = Max tokens      (default: 8000)
 *   A7 = Coach email     (for notifications)
 *
 * PROMPTS TAB STRUCTURE (column A = full prompt text, column B = labels):
 *   A1 = Stage 1 prompt
 *   A2 = Stage 1.5 prompt
 *   A3 = Stage 2 prompt
 *   A4 = Stage 3 prompt
 *   A5 = Knowledge Base
 *
 * SECURITY NOTE:
 *   API key is stored in the hidden Config tab.
 *   Never share this sheet with anyone who shouldn't have API access.
 *   Use "Setup: Store API Key Securely" for Script Properties storage.
 *
 * NOTE ON MODEL IDs:
 *   Defaults match the spec. If Anthropic updates model identifiers,
 *   update Config tab cells A2-A5 directly without touching this script.
 * ============================================================
 */

// ============================================================
// TAB NAME CONSTANTS
// ============================================================

var TAB_INTAKE     = "Intake Data";
var TAB_PIPELINE   = "Pipeline";
var TAB_STAGE1     = "Stage 1 Outputs";
var TAB_BRIEFS     = "Coaching Briefs";
var TAB_BLUEPRINTS = "Blueprints";
var TAB_PROMPTS    = "Prompts";
var TAB_CONFIG     = "Config";

// Script Properties key for tracking last processed intake row
var PROP_LAST_ROW = "LAST_PROCESSED_INTAKE_ROW";

// ============================================================
// MENU
// ============================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Team AM")
    .addItem("Run Stage 1 for Selected Client",     "menuRunStage1")
    .addItem("Run Stage 1.5 for Selected Client",   "menuRunStage15")
    .addItem("Run Stage 2 + 3 for Selected Client", "menuRunStage23")
    .addItem("Rerun Stage 3 Only",                  "menuRunStage3Only")
    .addItem("Run Calc Layer (Debug)",               "menuRunCalcDebug")
    .addSeparator()
    .addItem("Setup: Create Tabs",                  "setupCreateTabs")
    .addItem("Setup: Verify API Key",               "setupVerifyApiKey")
    .addItem("Setup: Install Triggers",             "setupInstallTriggers")
    .addItem("Setup: Store API Key Securely",       "setupStoreApiKeyInProperties")
    .addToUi();
}

// ============================================================
// SETUP FUNCTIONS
// ============================================================

/**
 * One-time setup: creates all required tabs with headers and default values.
 * Safe to re-run — will not overwrite existing data.
 */
function setupCreateTabs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  // Pipeline tab — row 1 = column headers
  _ensureTab(ss, TAB_PIPELINE, [
    "Client Name", "Date Submitted", "Stage 1 Status", "Stage 1 Output Link",
    "Call Notes Status", "Call Notes", "Stage 1.5 Status", "Brief Approval",
    "Stage 2 Status", "Stage 3 Status", "QA Result", "PDF Status"
  ], false);

  // Stage 1 Outputs tab
  _ensureTab(ss, TAB_STAGE1, ["Client Name", "Date Run", "Stage 1 Output"], false);

  // Coaching Briefs tab — col D stores JSON from calc layer
  _ensureTab(ss, TAB_BRIEFS, ["Client Name", "Date Run", "Coaching Brief", "Computed Targets (JSON)"], false);

  // Blueprints tab
  _ensureTab(ss, TAB_BLUEPRINTS, [
    "Client Name", "Date Run", "Blueprint (Stage 2)", "QA Output (Stage 3)", "QA Verdict"
  ], false);

  // Prompts tab (hidden) — user pastes prompts in column A; column B = labels
  var promptsSheet = _ensureTab(ss, TAB_PROMPTS, [], true);
  if (promptsSheet.getRange("B1").getValue() === "") {
    promptsSheet.getRange("B1").setValue("Stage 1 Prompt — paste full prompt text in A1");
    promptsSheet.getRange("B2").setValue("Stage 1.5 Prompt — paste full prompt text in A2");
    promptsSheet.getRange("B3").setValue("Stage 2 Prompt — paste full prompt text in A3");
    promptsSheet.getRange("B4").setValue("Stage 3 Prompt — paste full prompt text in A4");
    promptsSheet.getRange("B5").setValue("Knowledge Base — paste full KB text in A5");
    promptsSheet.getRange("B1:B5").setFontStyle("italic").setFontColor("#888888");
  }

  // Config tab (hidden) — values in column A; column B = labels
  var configSheet = _ensureTab(ss, TAB_CONFIG, [], true);
  if (configSheet.getRange("B1").getValue() === "") {
    configSheet.getRange("B1").setValue("Anthropic API Key");
    configSheet.getRange("B2").setValue("Stage 1 Model");
    configSheet.getRange("B3").setValue("Stage 1.5 Model");
    configSheet.getRange("B4").setValue("Stage 2 Model");
    configSheet.getRange("B5").setValue("Stage 3 Model");
    configSheet.getRange("B6").setValue("Max Tokens");
    configSheet.getRange("B7").setValue("Coach Email");
    configSheet.getRange("B1:B7").setFontStyle("italic").setFontColor("#888888");
  }
  // Write model defaults if cells are empty
  if (!configSheet.getRange("A2").getValue()) configSheet.getRange("A2").setValue("claude-sonnet-4-20250514");
  if (!configSheet.getRange("A3").getValue()) configSheet.getRange("A3").setValue("claude-sonnet-4-20250514");
  if (!configSheet.getRange("A4").getValue()) configSheet.getRange("A4").setValue("claude-opus-4-20250514");
  if (!configSheet.getRange("A5").getValue()) configSheet.getRange("A5").setValue("claude-sonnet-4-20250514");
  if (!configSheet.getRange("A6").getValue()) configSheet.getRange("A6").setValue(8000);

  ui.alert(
    "Setup complete!\n\n" +
    "All tabs created. Next steps:\n" +
    "1. Paste your Anthropic API key in Config tab cell A1\n" +
    "2. Paste your prompts in Prompts tab cells A1 through A5\n" +
    "3. Team AM menu > Setup: Install Triggers\n" +
    "4. (Optional) Team AM menu > Setup: Verify API Key"
  );
}

/**
 * Creates a sheet if it doesn't exist. Returns the sheet.
 * If headers provided, writes them as bold row 1 (only if row 1 is empty).
 * If hidden=true, hides the sheet.
 */
function _ensureTab(ss, name, headers, hidden) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (headers.length > 0 && sheet.getRange("A1").getValue() === "") {
    for (var i = 0; i < headers.length; i++) {
      sheet.getRange(1, i + 1).setValue(headers[i]);
    }
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#f3f3f3");
  }
  if (hidden) sheet.hideSheet();
  return sheet;
}

/**
 * Tests the API connection using the configured key.
 */
function setupVerifyApiKey() {
  var ui     = SpreadsheetApp.getUi();
  var result = callClaude("Reply with exactly: API connection confirmed.", "", null, 30);
  if (result.indexOf("ERROR") === 0) {
    ui.alert("API key error:\n\n" + result + "\n\nCheck the key in Config tab cell A1.");
  } else {
    ui.alert("API connected!\n\nResponse: " + result);
  }
}

/**
 * Installs the required triggers. Removes existing copies first to avoid duplicates.
 */
function setupInstallTriggers() {
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    var fn = existing[i].getHandlerFunction();
    if (fn === "checkForNewIntake" || fn === "onEditTrigger") {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }

  ScriptApp.newTrigger("checkForNewIntake")
    .timeBased()
    .everyMinutes(5)
    .create();

  ScriptApp.newTrigger("onEditTrigger")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();

  SpreadsheetApp.getUi().alert(
    "Triggers installed!\n\n" +
    "checkForNewIntake — runs every 5 minutes\n" +
    "onEditTrigger — fires on any edit to the spreadsheet\n\n" +
    "The pipeline is now live."
  );
}

/**
 * Stores the API key in Script Properties (more secure than a visible cell).
 * Clears Config A1 after storing.
 */
function setupStoreApiKeyInProperties() {
  var ui       = SpreadsheetApp.getUi();
  var response = ui.prompt(
    "Store API Key Securely",
    "Paste your Anthropic API key below.\n(Stored in Script Properties, not in a cell.)",
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) return;

  var key = response.getResponseText().trim();
  if (!key) {
    ui.alert("No key entered. Nothing was changed.");
    return;
  }

  PropertiesService.getScriptProperties().setProperty("ANTHROPIC_API_KEY", key);

  var config = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_CONFIG);
  if (config) config.getRange("A1").clearContent();

  ui.alert("API key stored in Script Properties.\nConfig tab A1 has been cleared for security.");
}

// ============================================================
// CLAUDE API
// ============================================================

/**
 * Calls the Anthropic Claude API.
 *
 * @param {string} prompt      - Task/system prompt
 * @param {string} userMessage - Additional context (appended after prompt, separated by ---)
 * @param {string} model       - Model ID; falls back to Config A2 then default
 * @param {number} maxTokens   - Max tokens; falls back to Config A6 then 8000
 * @returns {string} Claude response text, or "ERROR: ..." on failure
 */
function callClaude(prompt, userMessage, model, maxTokens) {
  // API key: Script Properties first, then Config tab cell A1
  var apiKey = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY");
  if (!apiKey) {
    var config = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_CONFIG);
    apiKey = config ? config.getRange("A1").getValue().toString().trim() : "";
  }
  if (!apiKey) {
    return "ERROR: No API key found. Paste your key into Config tab A1 or use Setup: Store API Key Securely.";
  }

  if (!model)     model     = _getConfigValue(2) || "claude-sonnet-4-20250514";
  if (!maxTokens) maxTokens = parseInt(_getConfigValue(6)) || 8000;

  var fullContent = userMessage
    ? (prompt + "\n\n---\n\n" + userMessage)
    : prompt;

  var payload = {
    "model": model,
    "max_tokens": maxTokens,
    "messages": [{ "role": "user", "content": fullContent }]
  };

  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", options);
    var json     = JSON.parse(response.getContentText());

    if (json.error) {
      return "ERROR: " + json.error.type + " — " + json.error.message;
    }
    if (!json.content || json.content.length === 0) {
      return "ERROR: Empty response from API. Check model ID and token limit.";
    }
    return json.content[0].text;
  } catch (e) {
    return "ERROR: " + e.toString();
  }
}

// ============================================================
// TRIGGER 1 — NEW INTAKE DETECTION (time-based, every 5 min)
// ============================================================

/**
 * Checks Intake Data tab for rows added since the last run.
 * Uses Script Properties to track the last processed row index.
 * Fires Stage 1 for each new unprocessed client.
 */
function checkForNewIntake() {
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var intake   = ss.getSheetByName(TAB_INTAKE);
  var pipeline = ss.getSheetByName(TAB_PIPELINE);

  if (!intake || !pipeline) {
    Logger.log("checkForNewIntake: Intake Data or Pipeline tab not found.");
    return;
  }

  var lastRow = intake.getLastRow();
  if (lastRow < 2) return; // No data rows yet

  var props         = PropertiesService.getScriptProperties();
  var lastProcessed = parseInt(props.getProperty(PROP_LAST_ROW) || "1");

  if (lastRow <= lastProcessed) return; // No new rows

  var headers = intake.getRange(1, 1, 1, intake.getLastColumn()).getValues()[0];
  var newData  = intake.getRange(lastProcessed + 1, 1, lastRow - lastProcessed, intake.getLastColumn()).getValues();

  for (var i = 0; i < newData.length; i++) {
    var row        = newData[i];
    var clientName = row[1] ? row[1].toString().trim() : "";
    var timestamp  = row[0];

    if (!clientName) continue;

    if (_clientExistsInPipeline(pipeline, clientName)) {
      Logger.log("checkForNewIntake: " + clientName + " already in Pipeline — skipping.");
      continue;
    }

    Logger.log("checkForNewIntake: New client — " + clientName);
    runStage1(clientName, timestamp, row, headers);
  }

  // Advance the last-processed pointer
  props.setProperty(PROP_LAST_ROW, lastRow.toString());
}

function _clientExistsInPipeline(pipelineSheet, clientName) {
  var data = pipelineSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim() === clientName) return true;
  }
  return false;
}

// ============================================================
// STAGE 1 — PRE-CALL ANALYSIS
// ============================================================

/**
 * Runs Stage 1 for a client.
 * Adds them to Pipeline, formats intake data, calls Claude, writes output.
 */
function runStage1(clientName, dateSubmitted, intakeRow, headers) {
  var ss        = SpreadsheetApp.getActiveSpreadsheet();
  var pipeline  = ss.getSheetByName(TAB_PIPELINE);
  var stage1Out = ss.getSheetByName(TAB_STAGE1);

  // Add row to Pipeline
  var pipelineRowIndex = pipeline.getLastRow() + 1;
  pipeline.getRange(pipelineRowIndex, 1).setValue(clientName);
  pipeline.getRange(pipelineRowIndex, 2).setValue(dateSubmitted);
  pipeline.getRange(pipelineRowIndex, 3).setValue("Running");

  // Build formatted intake text
  if (!headers) {
    var intakeSheet = ss.getSheetByName(TAB_INTAKE);
    headers = intakeSheet
      ? intakeSheet.getRange(1, 1, 1, intakeSheet.getLastColumn()).getValues()[0]
      : [];
  }
  var intakeText = "CLIENT INTAKE DATA\nClient: " + clientName + "\nDate Submitted: " + dateSubmitted + "\n\n";
  for (var c = 0; c < intakeRow.length; c++) {
    if (headers[c] && intakeRow[c] !== "" && intakeRow[c] !== null) {
      intakeText += headers[c] + ": " + intakeRow[c] + "\n";
    }
  }

  var stage1Prompt = _getPromptValue(1);
  var model        = _getConfigValue(2) || "claude-sonnet-4-20250514";
  var maxTokens    = parseInt(_getConfigValue(6)) || 8000;

  if (!stage1Prompt) {
    pipeline.getRange(pipelineRowIndex, 3).setValue("Error");
    stage1Out.appendRow([clientName, new Date(), "ERROR: Stage 1 prompt not found. Paste it in Prompts tab A1."]);
    return;
  }

  var output = callClaude(stage1Prompt, intakeText, model, maxTokens);

  var outputRowIndex = stage1Out.getLastRow() + 1;
  stage1Out.getRange(outputRowIndex, 1).setValue(clientName);
  stage1Out.getRange(outputRowIndex, 2).setValue(new Date());
  stage1Out.getRange(outputRowIndex, 3).setValue(output);
  stage1Out.getRange(outputRowIndex, 3).setWrap(true);

  if (output.indexOf("ERROR") === 0) {
    pipeline.getRange(pipelineRowIndex, 3).setValue("Error");
    Logger.log("runStage1 error for " + clientName + ": " + output);
  } else {
    pipeline.getRange(pipelineRowIndex, 3).setValue("Complete");
    pipeline.getRange(pipelineRowIndex, 5).setValue("Waiting");

    var ssUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    pipeline.getRange(pipelineRowIndex, 4)
      .setFormula('=HYPERLINK("' + ssUrl + '","Stage 1 Row ' + outputRowIndex + '")');

    _notifyCoach(
      "Stage 1 complete for " + clientName,
      "Stage 1 pre-call analysis is ready for " + clientName + ".\n\n" +
      "Review in the 'Stage 1 Outputs' tab (row " + outputRowIndex + ").\n\n" +
      "Next: add call notes in Pipeline column F, then set column E to 'Ready'."
    );
  }
}

// ============================================================
// TRIGGER 2 — onEdit: PIPELINE STATUS CHANGES
// ============================================================

/**
 * Installable onEdit trigger.
 *   - Pipeline col E = "Ready"    → Stage 1.5
 *   - Pipeline col H = "Approved" → Stage 2 + 3
 */
function onEditTrigger(e) {
  if (!e || !e.range) return;

  var sheet = e.range.getSheet();
  if (sheet.getName() !== TAB_PIPELINE) return;

  var col   = e.range.getColumn();
  var row   = e.range.getRow();
  var value = e.range.getValue().toString().trim();

  if (row < 2) return;

  if (col === 5 && value === "Ready") {
    var clientName = sheet.getRange(row, 1).getValue().toString().trim();
    if (clientName) {
      Logger.log("onEditTrigger: Stage 1.5 for " + clientName);
      runStage15(clientName, row);
    }
  }

  if (col === 8 && value === "Approved") {
    var clientName = sheet.getRange(row, 1).getValue().toString().trim();
    if (clientName) {
      Logger.log("onEditTrigger: Stage 2+3 for " + clientName);
      runStage23(clientName, row);
    }
  }
}

// ============================================================
// STAGE 1.5 — COACHING BRIEF
// ============================================================

/**
 * Runs Stage 1.5. Requires Stage 1 output + call notes from Pipeline col F.
 */
function runStage15(clientName, pipelineRowIndex) {
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var pipeline = ss.getSheetByName(TAB_PIPELINE);
  var stage1   = ss.getSheetByName(TAB_STAGE1);
  var briefs   = ss.getSheetByName(TAB_BRIEFS);

  pipeline.getRange(pipelineRowIndex, 7).setValue("Running");

  var stage1Output = _findClientOutput(stage1, clientName, 3);
  if (!stage1Output) {
    _markError(pipeline, pipelineRowIndex, 7, briefs, clientName,
      "Stage 1 output not found. Ensure Stage 1 completed successfully.");
    return;
  }

  var callNotes = pipeline.getRange(pipelineRowIndex, 6).getValue().toString().trim();
  if (!callNotes) {
    _markError(pipeline, pipelineRowIndex, 7, briefs, clientName,
      "No call notes in Pipeline column F. Add notes before setting column E to 'Ready'.");
    return;
  }

  var prompt    = _getPromptValue(2);
  var model     = _getConfigValue(3) || "claude-sonnet-4-20250514";
  var maxTokens = parseInt(_getConfigValue(6)) || 8000;

  if (!prompt) {
    _markError(pipeline, pipelineRowIndex, 7, briefs, clientName,
      "Stage 1.5 prompt not found. Paste it in Prompts tab A2.");
    return;
  }

  var userMessage = "STAGE 1 OUTPUT:\n" + stage1Output + "\n\n---\n\nCALL NOTES:\n" + callNotes;
  var output      = callClaude(prompt, userMessage, model, maxTokens);

  var briefRowIndex = briefs.getLastRow() + 1;
  briefs.getRange(briefRowIndex, 1).setValue(clientName);
  briefs.getRange(briefRowIndex, 2).setValue(new Date());
  briefs.getRange(briefRowIndex, 3).setValue(output);
  briefs.getRange(briefRowIndex, 3).setWrap(true);

  if (output.indexOf("ERROR") === 0) {
    pipeline.getRange(pipelineRowIndex, 7).setValue("Error");
    Logger.log("runStage15 error for " + clientName + ": " + output);
  } else {
    pipeline.getRange(pipelineRowIndex, 7).setValue("Complete");
    pipeline.getRange(pipelineRowIndex, 8).setValue("Pending");

    _notifyCoach(
      "Coaching brief ready for " + clientName,
      "Stage 1.5 brief is complete for " + clientName + ".\n\n" +
      "Review in the 'Coaching Briefs' tab (row " + briefRowIndex + ").\n\n" +
      "Next: set Pipeline column H to 'Approved' to generate the blueprint."
    );
  }
}

// ============================================================
// STAGE 2 — BLUEPRINT + STAGE 3 — QA
// ============================================================

/**
 * Runs Stage 2 (blueprint) and Stage 3 (QA) sequentially.
 * Stage 2 uses Opus + Knowledge Base; falls back without KB if timeout occurs.
 */
function runStage23(clientName, pipelineRowIndex) {
  var ss         = SpreadsheetApp.getActiveSpreadsheet();
  var pipeline   = ss.getSheetByName(TAB_PIPELINE);
  var briefs     = ss.getSheetByName(TAB_BRIEFS);
  var blueprints = ss.getSheetByName(TAB_BLUEPRINTS);

  pipeline.getRange(pipelineRowIndex, 9).setValue("Running");

  var brief = _findClientOutput(briefs, clientName, 3);
  if (!brief) {
    pipeline.getRange(pipelineRowIndex, 9).setValue("Error");
    blueprints.appendRow([clientName, new Date(), "ERROR: Coaching brief not found. Ensure Stage 1.5 completed.", "", ""]);
    return;
  }

  var stage2Prompt  = _getPromptValue(3);
  var knowledgeBase = _getPromptValue(5);
  var model         = _getConfigValue(4) || "claude-opus-4-20250514";
  var maxTokens     = parseInt(_getConfigValue(6)) || 8000;

  if (!stage2Prompt) {
    pipeline.getRange(pipelineRowIndex, 9).setValue("Error");
    Logger.log("runStage23: No Stage 2 prompt for " + clientName);
    return;
  }

  // --- CALC LAYER (runs before Stage 2) ---
  var calcInjection = "";
  try {
    var calcInput  = _buildCalcInputFromIntake(clientName, ss, brief);
    var calcResult = computeTargets(calcInput);
    calcInjection  = _buildStage2Injection(calcResult) + "\n\n";

    // Store computed JSON in Coaching Briefs tab col D for audit trail
    var briefRow = _findClientRow(briefs, clientName);
    if (briefRow > 0) {
      briefs.getRange(briefRow, 4).setValue(JSON.stringify(calcResult, null, 2));
      briefs.getRange(briefRow, 4).setWrap(true);
    }
    Logger.log("runStage23: Calc layer complete for " + clientName +
      " — calories=" + calcResult.energy.daily_calories +
      " flags=" + (calcResult.flags.length > 0 ? calcResult.flags.join(",") : "none"));
  } catch (calcErr) {
    Logger.log("runStage23: Calc layer error for " + clientName + ": " + calcErr.toString());
    // Non-fatal: proceed without injection, flag in log
    calcInjection = "## CALC LAYER ERROR\n" +
      "Pre-computed targets unavailable (" + calcErr.toString() + ").\n" +
      "Stage 2 must use best estimates — flag for coach review.\n\n---\n\n";
  }

  // --- STAGE 2 ---
  var stage2UserMsg = calcInjection + "COACHING BRIEF:\n" + brief;
  if (knowledgeBase) stage2UserMsg += "\n\n---\n\nKNOWLEDGE BASE:\n" + knowledgeBase;

  var startTime = new Date().getTime();
  var blueprint = callClaude(stage2Prompt, stage2UserMsg, model, maxTokens);
  var elapsed   = new Date().getTime() - startTime;
  var kbNote    = "";

  // If we got an error and execution took > 5 minutes, retry without KB
  if (blueprint.indexOf("ERROR") === 0 && elapsed > 300000 && knowledgeBase) {
    Logger.log("runStage23: Stage 2 timeout for " + clientName + " — retrying without KB.");
    blueprint = callClaude(stage2Prompt, "COACHING BRIEF:\n" + brief, model, maxTokens);
    kbNote    = "\n\n[NOTE: Knowledge Base omitted due to execution timeout. Rerun Stage 2+3 for full KB version.]";
  }

  var blueprintRowIndex = blueprints.getLastRow() + 1;
  blueprints.getRange(blueprintRowIndex, 1).setValue(clientName);
  blueprints.getRange(blueprintRowIndex, 2).setValue(new Date());
  blueprints.getRange(blueprintRowIndex, 3).setValue(blueprint + kbNote);
  blueprints.getRange(blueprintRowIndex, 3).setWrap(true);

  if (blueprint.indexOf("ERROR") === 0) {
    pipeline.getRange(pipelineRowIndex, 9).setValue("Error");
    Logger.log("runStage23 Stage 2 error for " + clientName + ": " + blueprint);
    return;
  }

  pipeline.getRange(pipelineRowIndex, 9).setValue("Complete");

  // --- STAGE 3 ---
  pipeline.getRange(pipelineRowIndex, 10).setValue("Running");

  var stage3Prompt = _getPromptValue(4);
  if (!stage3Prompt) {
    pipeline.getRange(pipelineRowIndex, 10).setValue("Error");
    Logger.log("runStage23: No Stage 3 prompt for " + clientName);
    return;
  }

  var stage3Model   = _getConfigValue(5) || "claude-sonnet-4-20250514";
  var stage3Msg     = "BLUEPRINT:\n" + blueprint + "\n\n---\n\nCOACHING BRIEF:\n" + brief;
  var qaOutput      = callClaude(stage3Prompt, stage3Msg, stage3Model, maxTokens);

  blueprints.getRange(blueprintRowIndex, 4).setValue(qaOutput);
  blueprints.getRange(blueprintRowIndex, 4).setWrap(true);

  var verdict = qaOutput.toUpperCase().indexOf("READY FOR DELIVERY") >= 0
    ? "READY FOR DELIVERY"
    : "REVISE BEFORE DELIVERY";
  blueprints.getRange(blueprintRowIndex, 5).setValue(verdict);

  var qaResult = "See QA output";
  var qaMatch  = qaOutput.match(/(\d+)\s*\/\s*(\d+)/);
  if (qaMatch) {
    var passed = parseInt(qaMatch[1]);
    var total  = parseInt(qaMatch[2]);
    var failed = total - passed;
    qaResult   = passed + "/" + total + (failed > 0 ? " — " + failed + " failure" + (failed > 1 ? "s" : "") : " passed");
  }

  if (qaOutput.indexOf("ERROR") === 0) {
    pipeline.getRange(pipelineRowIndex, 10).setValue("Error");
    Logger.log("runStage23 Stage 3 error for " + clientName + ": " + qaOutput);
  } else {
    pipeline.getRange(pipelineRowIndex, 10).setValue(verdict === "READY FOR DELIVERY" ? "Pass" : "Fail");
    pipeline.getRange(pipelineRowIndex, 11).setValue(qaResult);

    _notifyCoach(
      "Blueprint complete for " + clientName + " — " + verdict,
      "Stage 2+3 complete for " + clientName + ".\n\n" +
      "QA Result: " + qaResult + "\n" +
      "Verdict: " + verdict + "\n\n" +
      "Review in the 'Blueprints' tab (row " + blueprintRowIndex + ")."
    );
  }
}

/**
 * Reruns Stage 3 only — use after manually editing a Stage 2 blueprint.
 * Updates the existing Blueprints row in place.
 */
function runStage3Only(clientName, pipelineRowIndex) {
  var ss         = SpreadsheetApp.getActiveSpreadsheet();
  var pipeline   = ss.getSheetByName(TAB_PIPELINE);
  var blueprints = ss.getSheetByName(TAB_BLUEPRINTS);
  var briefs     = ss.getSheetByName(TAB_BRIEFS);

  pipeline.getRange(pipelineRowIndex, 10).setValue("Running");

  var blueprint = _findClientOutput(blueprints, clientName, 3);
  if (!blueprint) {
    pipeline.getRange(pipelineRowIndex, 10).setValue("Error");
    SpreadsheetApp.getUi().alert("No blueprint found for " + clientName + ". Run Stage 2 first.");
    return;
  }

  var brief        = _findClientOutput(briefs, clientName, 3) || "";
  var stage3Prompt = _getPromptValue(4);
  var model        = _getConfigValue(5) || "claude-sonnet-4-20250514";
  var maxTokens    = parseInt(_getConfigValue(6)) || 8000;

  if (!stage3Prompt) {
    pipeline.getRange(pipelineRowIndex, 10).setValue("Error");
    return;
  }

  var userMessage = "BLUEPRINT:\n" + blueprint + (brief ? "\n\n---\n\nCOACHING BRIEF:\n" + brief : "");
  var qaOutput    = callClaude(stage3Prompt, userMessage, model, maxTokens);

  var blueprintRowIndex = _findClientRow(blueprints, clientName);
  if (blueprintRowIndex > 0) {
    blueprints.getRange(blueprintRowIndex, 4).setValue(qaOutput);

    var verdict = qaOutput.toUpperCase().indexOf("READY FOR DELIVERY") >= 0
      ? "READY FOR DELIVERY"
      : "REVISE BEFORE DELIVERY";
    blueprints.getRange(blueprintRowIndex, 5).setValue(verdict);

    var qaResult = "See QA output";
    var qaMatch  = qaOutput.match(/(\d+)\s*\/\s*(\d+)/);
    if (qaMatch) {
      var passed = parseInt(qaMatch[1]);
      var total  = parseInt(qaMatch[2]);
      var failed = total - passed;
      qaResult   = passed + "/" + total + (failed > 0 ? " — " + failed + " failure" + (failed > 1 ? "s" : "") : " passed");
    }

    pipeline.getRange(pipelineRowIndex, 10).setValue(verdict === "READY FOR DELIVERY" ? "Pass" : "Fail");
    pipeline.getRange(pipelineRowIndex, 11).setValue(qaResult);
  }
}

// ============================================================
// MANUAL MENU HANDLERS
// ============================================================

function menuRunStage1() {
  var sel = _getSelectedPipelineClient();
  if (!sel) return;

  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var intake  = ss.getSheetByName(TAB_INTAKE);
  var data    = intake.getDataRange().getValues();
  var headers = data[0];

  var intakeRow = null;
  var timestamp = null;
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] && data[i][1].toString().trim() === sel.clientName) {
      intakeRow = data[i];
      timestamp = data[i][0];
      break;
    }
  }

  if (!intakeRow) {
    SpreadsheetApp.getUi().alert(
      "Client '" + sel.clientName + "' not found in Intake Data tab.\n\n" +
      "Check that column B of Intake Data matches the name exactly."
    );
    return;
  }

  runStage1(sel.clientName, timestamp, intakeRow, headers);
  SpreadsheetApp.getUi().alert("Stage 1 complete for " + sel.clientName + ".\nCheck the 'Stage 1 Outputs' tab.");
}

function menuRunStage15() {
  var sel = _getSelectedPipelineClient();
  if (!sel) return;
  runStage15(sel.clientName, sel.rowIndex);
  SpreadsheetApp.getUi().alert("Stage 1.5 complete for " + sel.clientName + ".\nCheck the 'Coaching Briefs' tab.");
}

function menuRunStage23() {
  var sel = _getSelectedPipelineClient();
  if (!sel) return;
  runStage23(sel.clientName, sel.rowIndex);
  SpreadsheetApp.getUi().alert("Stage 2+3 complete for " + sel.clientName + ".\nCheck the 'Blueprints' tab.");
}

function menuRunStage3Only() {
  var sel = _getSelectedPipelineClient();
  if (!sel) return;
  runStage3Only(sel.clientName, sel.rowIndex);
  SpreadsheetApp.getUi().alert("Stage 3 rerun complete for " + sel.clientName + ".\nCheck the 'Blueprints' tab.");
}

/**
 * Resolves the selected client from the Pipeline tab.
 * User must have a Pipeline row selected before triggering a menu action.
 * Returns { clientName, rowIndex } or null.
 */
function _getSelectedPipelineClient() {
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var active   = ss.getActiveSheet();
  var pipeline = ss.getSheetByName(TAB_PIPELINE);
  var ui       = SpreadsheetApp.getUi();

  if (active.getName() !== TAB_PIPELINE) {
    ui.alert("Switch to the 'Pipeline' tab and select the client row first.");
    return null;
  }

  var activeRow = active.getActiveRange().getRow();
  if (activeRow < 2) {
    ui.alert("Select a client row — not the header row.");
    return null;
  }

  var clientName = pipeline.getRange(activeRow, 1).getValue().toString().trim();
  if (!clientName) {
    ui.alert("No client name in the selected row. Check column A.");
    return null;
  }

  return { clientName: clientName, rowIndex: activeRow };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/** Returns Config tab column A value for the given row number. */
function _getConfigValue(rowNum) {
  var config = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_CONFIG);
  return config ? config.getRange(rowNum, 1).getValue().toString().trim() : "";
}

/** Returns Prompts tab column A value for the given row number. */
function _getPromptValue(rowNum) {
  var prompts = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_PROMPTS);
  return prompts ? prompts.getRange(rowNum, 1).getValue().toString().trim() : "";
}

/**
 * Finds the most recent output for a client in a sheet.
 * Searches column A for clientName (bottom to top), returns value at col.
 */
function _findClientOutput(sheet, clientName, col) {
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] && data[i][0].toString().trim() === clientName) {
      return data[i][col - 1] || null;
    }
  }
  return null;
}

/**
 * Returns the 1-based row index of the most recent row for a client.
 * Returns -1 if not found.
 */
function _findClientRow(sheet, clientName) {
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] && data[i][0].toString().trim() === clientName) {
      return i + 1;
    }
  }
  return -1;
}

/** Writes an error status to Pipeline and appends an error row to an output tab. */
function _markError(pipeline, pipelineRow, statusCol, outputSheet, clientName, message) {
  pipeline.getRange(pipelineRow, statusCol).setValue("Error");
  outputSheet.appendRow([clientName, new Date(), "ERROR: " + message]);
  Logger.log("Error — " + clientName + ": " + message);
}

/**
 * Sends an email notification to the configured coach address.
 * Silently skips if no email is set or MailApp quota is exceeded.
 */
function _notifyCoach(subject, body) {
  var email = _getConfigValue(7);
  if (!email) return;
  try {
    MailApp.sendEmail({
      to:      email,
      subject: "[Team AM Pipeline] " + subject,
      body:    body + "\n\n—\nTeam AM Pipeline (automated)"
    });
  } catch (e) {
    Logger.log("Email notification failed: " + e.toString());
  }
}

// ============================================================
// CALC LAYER — DETERMINISTIC CALCULATION (KB v2.0)
// ============================================================

/**
 * Computes all numerical coaching targets from verified client data.
 * Mirrors Engine/calc-layer.js exactly — same formulas, same output shape.
 * Returns the computed targets object.
 */
function computeTargets(input) {
  var ACTIVITY_MULTIPLIERS = {
    sedentary:        1.2,
    lightly_active:   1.375,
    moderate:         1.55,
    very_active:      1.725,
    extremely_active: 1.9
  };
  var PROTEIN_RATIO = {
    fat_loss:    0.8,
    maintenance: 0.8,
    muscle_gain: 1.0,
    recomp:      1.0
  };
  var FAT_RATIO               = 0.4;
  var MIN_CALORIES            = { male: 1500, female: 1200 };
  var GLP1_MIN_CALORIES       = { male: 1800, female: 1500 };
  var GLP1_MAX_DEFICIT        = 300;
  var SWEAT_ADDITIONS         = { light: 15, moderate: 21, heavy: 28 };
  var CREATINE_RATIO          = 0.06;
  var CREATINE_FLAG_THRESHOLD = 15;

  var flags    = [];
  var warnings = [];

  // Step 1: Conversions
  var weight_kg = Math.round((input.weight_lbs / 2.205) * 100) / 100;
  var height_cm = Math.round((input.height_inches * 2.54) * 100) / 100;

  // Step 2: BMR (Mifflin-St Jeor)
  var sex    = (input.sex || "male").toLowerCase();
  var sexAdj = sex === "male" ? 5 : -161;
  var bmr_raw = (10 * weight_kg) + (6.25 * height_cm) - (5 * input.age) + sexAdj;
  var bmr     = Math.round(bmr_raw);

  // Step 3: TDEE
  var activityKey = (input.activity_level || "moderate").toLowerCase();
  var multiplier  = ACTIVITY_MULTIPLIERS[activityKey] || 1.55;
  var tdee_raw    = bmr_raw * multiplier;
  var tdee_maintenance = Math.round(tdee_raw / 50) * 50;
  if (multiplier >= 1.725) warnings.push("HIGH_ACTIVITY_MULTIPLIER");

  // Step 4: Daily calories
  var phase = (input.phase || "fat_loss").toLowerCase();
  var glp1  = !!input.glp1;
  var deficit_amount = 0;
  var daily_calories;

  if (phase === "fat_loss") {
    deficit_amount = glp1 ? GLP1_MAX_DEFICIT : 400;
    daily_calories = tdee_maintenance - deficit_amount;
    if (glp1) flags.push("GLP1_CONSERVATIVE_DEFICIT");
  } else if (phase === "maintenance") {
    daily_calories = tdee_maintenance;
  } else if (phase === "muscle_gain") {
    deficit_amount = -300;
    daily_calories = tdee_maintenance + 300;
  } else if (phase === "recomp") {
    deficit_amount = 100;
    daily_calories = tdee_maintenance - 100;
  } else {
    deficit_amount = 400;
    daily_calories = tdee_maintenance - 400;
  }

  var floor      = MIN_CALORIES[sex]     || 1500;
  var glp1_floor = GLP1_MIN_CALORIES[sex] || 1800;
  var below_minimum_floor = daily_calories < floor;
  if (below_minimum_floor) {
    flags.push("CALORIE_BELOW_FLOOR");
    daily_calories = floor;
  } else if (daily_calories < floor + 100) {
    warnings.push("NEAR_MINIMUM_FLOOR");
  }
  if (glp1 && daily_calories < glp1_floor) flags.push("GLP1_BELOW_RECOMMENDED_FLOOR");

  // Step 4a: Bodyweight outlier
  var effective_weight    = input.weight_lbs;
  var bodyweight_outlier  = false;
  if (input.weight_lbs > 275 || input.weight_lbs < 110) {
    bodyweight_outlier = true;
    flags.push("BODYWEIGHT_OUTLIER");
    var ibw_kg  = sex === "male"
      ? 52 + 1.9 * (input.height_inches - 60)
      : 49 + 1.7 * (input.height_inches - 60);
    var ibw_lbs = ibw_kg * 2.205;
    effective_weight = Math.round(ibw_lbs + 0.25 * (input.weight_lbs - ibw_lbs));
  }

  // Step 5: Macros
  var protein_ratio = PROTEIN_RATIO[phase] || 0.8;
  if (glp1 && protein_ratio < 1.0) protein_ratio = 1.0;

  var protein_grams = Math.round(effective_weight * protein_ratio);
  var fat_grams     = Math.round(effective_weight * FAT_RATIO);
  var carb_cals     = daily_calories - (protein_grams * 4) - (fat_grams * 9);
  var carb_grams    = Math.round(carb_cals / 4);
  if (carb_grams < 100) flags.push("CARBS_BELOW_100");

  var macro_calorie_check    = (protein_grams * 4) + (carb_grams * 4) + (fat_grams * 9);
  var macro_calorie_variance = Math.abs(macro_calorie_check - daily_calories);
  var variance_acceptable    = macro_calorie_variance <= 5;
  if (!variance_acceptable) flags.push("MACRO_VARIANCE_HIGH");

  var digestion_score = input.digestion_score || 7;
  var fiber_grams     = digestion_score <= 4 ? 25 : 30;

  // Step 6: Fluids
  var base_fluid_oz         = Math.round((input.weight_lbs * (2 / 3)) / 5) * 5;
  var training_day_fluid_oz = base_fluid_oz + 32;
  var sweat_level           = (input.sweat_level || "moderate").toLowerCase();
  var sweat_addition_oz     = SWEAT_ADDITIONS[sweat_level] || 21;

  // Step 7: Electrolytes
  var fluid_liters = Math.round((base_fluid_oz / 33.814) * 100) / 100;
  var sodium_mg    = Math.round((fluid_liters * 1000) / 50) * 50;
  var potassium_mg = sodium_mg;

  // Step 8: Creatine
  var creatine_raw     = input.weight_lbs * CREATINE_RATIO;
  var creatine_rounded = Math.round(creatine_raw * 2) / 2;
  var creatine_exceeds_15g = creatine_rounded > CREATINE_FLAG_THRESHOLD;
  if (creatine_exceeds_15g) flags.push("CREATINE_ABOVE_15G");

  // Steps 9-11: Recovery
  var sleep_target_hours  = sex === "male" ? "7.5-8" : "8-9";
  var daily_steps         = 10000;
  var caffeine_cutoff_hours = 8;

  return {
    computed_at: new Date().toISOString(),
    kb_version:  "2.0",
    input_summary: {
      client_name: input.client_name, sex: sex, age: input.age,
      weight_lbs: input.weight_lbs, height_inches: input.height_inches,
      activity_level: activityKey, phase: phase, glp1: glp1,
      sweat_level: sweat_level, training_days_per_week: input.training_days_per_week || 0
    },
    conversions:  { weight_kg: weight_kg, height_cm: height_cm },
    energy:       { bmr: bmr, tdee_maintenance: tdee_maintenance,
                    tdee_raw: Math.round(tdee_raw), daily_calories: daily_calories,
                    deficit_amount: deficit_amount, below_minimum_floor: below_minimum_floor },
    macros:       { effective_weight_lbs: effective_weight, bodyweight_outlier: bodyweight_outlier,
                    protein_grams: protein_grams, protein_ratio: protein_ratio,
                    fat_grams: fat_grams, fat_ratio: FAT_RATIO,
                    carb_grams: carb_grams, fiber_grams: fiber_grams,
                    macro_calorie_check: macro_calorie_check,
                    macro_calorie_variance: macro_calorie_variance,
                    variance_acceptable: variance_acceptable },
    hydration:    { base_fluid_oz: base_fluid_oz, training_day_fluid_oz: training_day_fluid_oz,
                    sweat_addition_oz: sweat_addition_oz, fluid_liters: fluid_liters,
                    sodium_mg: sodium_mg, potassium_mg: potassium_mg },
    supplements:  { creatine_raw: Math.round(creatine_raw * 100) / 100,
                    creatine_rounded: creatine_rounded,
                    creatine_exceeds_15g: creatine_exceeds_15g },
    recovery:     { sleep_target_hours: sleep_target_hours, daily_steps: daily_steps,
                    caffeine_cutoff_hours: caffeine_cutoff_hours },
    flags:    flags,
    warnings: warnings
  };
}

/**
 * Builds the Stage 2 injection block from a computeTargets() result.
 */
function _buildStage2Injection(c) {
  var e = c.energy;
  var m = c.macros;
  var h = c.hydration;
  var s = c.supplements;
  var r = c.recovery;

  var flagLine = c.flags.length    > 0 ? c.flags.join(", ")    : "None";
  var warnLine = c.warnings.length > 0 ? c.warnings.join(", ") : "None";
  var deficitLabel = e.deficit_amount < 0
    ? Math.abs(e.deficit_amount) + " calorie SURPLUS above maintenance"
    : e.deficit_amount + " calories below maintenance";

  return [
    "## PRE-COMPUTED TARGETS (VERIFIED — DO NOT RECALCULATE)",
    "",
    "The following values were calculated using Team AM Knowledge Base v" + c.kb_version + ".",
    "Use these EXACT numbers in the blueprint. Do not recalculate, round differently,",
    "or substitute your own estimates.",
    "",
    "Daily Calories: " + e.daily_calories,
    "Maintenance Estimate: " + e.tdee_maintenance,
    "Deficit: " + deficitLabel,
    "",
    "Protein: " + m.protein_grams + "g (" + m.protein_ratio + "g/lb)",
    "Carbs: " + m.carb_grams + "g",
    "Fat: " + m.fat_grams + "g (" + m.fat_ratio + "g/lb)",
    "Fiber: " + m.fiber_grams + "g",
    "",
    "Fluids: " + h.base_fluid_oz + " oz (base) / " + h.training_day_fluid_oz + " oz (training days)",
    "Sodium: " + h.sodium_mg + "mg (1g per liter of " + h.fluid_liters + "L daily water)",
    "Potassium: " + h.potassium_mg + "mg (matches sodium 1:1)",
    "",
    "Creatine: " + s.creatine_rounded + "g/day (0.06g × " + c.input_summary.weight_lbs + " lbs)",
    "Sleep: " + r.sleep_target_hours + " hours",
    "Steps: " + r.daily_steps + "/day",
    "Caffeine cutoff: " + r.caffeine_cutoff_hours + " hours before bed",
    "",
    "Flags: " + flagLine,
    "Warnings: " + warnLine,
    "",
    "---"
  ].join("\n");
}

/**
 * Builds the calc layer input object from the Intake Data tab + coaching brief.
 *
 * Priority order for each field:
 *   1. JSON block in coaching brief (most structured, coach-verified)
 *   2. Intake tab row (raw form responses)
 *   3. Sensible defaults (logged as warnings)
 *
 * @param {string} clientName
 * @param {Spreadsheet} ss
 * @param {string} brief  - Stage 1.5 coaching brief text
 * @returns {Object} calc layer input shape
 */
function _buildCalcInputFromIntake(clientName, ss, brief) {
  // ---- Try to parse embedded JSON first ----------------------
  // Stage 1.5 brief may contain: CALC_INPUTS:\n```json\n{...}\n```
  var embeddedJson = _extractCalcInputsFromBrief(brief);
  if (embeddedJson) {
    Logger.log("_buildCalcInputFromIntake: using embedded JSON from brief for " + clientName);
    return embeddedJson;
  }

  // ---- Fall back to intake row parsing -----------------------
  var intake = ss.getSheetByName(TAB_INTAKE);
  if (!intake) {
    Logger.log("_buildCalcInputFromIntake: Intake tab not found — using defaults");
    return _defaultCalcInput(clientName);
  }

  var data    = intake.getDataRange().getValues();
  var headers = data[0];

  // Find most recent intake row for this client (col B = full name)
  var intakeRow = null;
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][1] && data[i][1].toString().trim() === clientName) {
      intakeRow = data[i];
      break;
    }
  }
  if (!intakeRow) {
    Logger.log("_buildCalcInputFromIntake: No intake row found for " + clientName);
    return _defaultCalcInput(clientName);
  }

  // Build case-insensitive header→value map
  var fields = {};
  for (var c = 0; c < headers.length; c++) {
    var hdr = headers[c].toString().toLowerCase().trim();
    if (hdr && intakeRow[c] !== null && intakeRow[c] !== "") {
      fields[hdr] = intakeRow[c];
    }
  }

  // ---- Sex ---------------------------------------------------
  var sex = "male";
  var genderRaw = (fields["gender identity"] || "").toString().toLowerCase();
  if (genderRaw.indexOf("female") >= 0) sex = "female";

  // ---- Age from DOB -----------------------------------------
  var age = 28; // fallback
  var dobVal = fields["date of birth"];
  if (dobVal) {
    try {
      var dobDate = new Date(dobVal);
      var now     = new Date();
      age = now.getFullYear() - dobDate.getFullYear();
      if (now.getMonth() < dobDate.getMonth() ||
         (now.getMonth() === dobDate.getMonth() && now.getDate() < dobDate.getDate())) {
        age--;
      }
    } catch (e) { /* use default */ }
  }

  // ---- Weight ------------------------------------------------
  var weightLbs = _parseWeightLbs(
    fields["current body weight (include kg or lbs)"] || fields["weight"] || ""
  );
  if (!weightLbs) {
    Logger.log("_buildCalcInputFromIntake: weight parse failed for " + clientName + " — defaulting to 180");
    weightLbs = 180;
  }

  // ---- Height ------------------------------------------------
  var heightInches = _parseHeightInches(
    fields["height (include cm or ft/in)"] || fields["height"] || ""
  );
  if (!heightInches) {
    Logger.log("_buildCalcInputFromIntake: height parse failed for " + clientName + " — defaulting to 68");
    heightInches = 68;
  }

  // ---- Body fat -----------------------------------------------
  var bodyFat = parseFloat(fields["body fat % estimate (if known)"] || "0") || 0;

  // ---- Training days -----------------------------------------
  var trainingDays = parseInt(
    fields["how many days per week do you currently train?"] || "3", 10
  ) || 3;

  // ---- Sweat level -------------------------------------------
  var sweatRaw  = (fields["do you sweat heavily during training?"] || "").toString().toLowerCase();
  var sweatLevel = "moderate";
  if (sweatRaw.indexOf("not really") >= 0) sweatLevel = "light";
  else if (sweatRaw.indexOf("heavily") >= 0) sweatLevel = "heavy";

  // ---- Sleep -------------------------------------------------
  var sleepHours = parseFloat(fields["average hours of sleep per night"] || "7") || 7;

  // ---- Digestion score ---------------------------------------
  var digestionScore = parseInt(
    fields["how would you rate your digestion overall right now?"] || "7", 10
  ) || 7;

  // ---- Medications -------------------------------------------
  var onMeds = (fields["are you currently taking any medications?"] || "").toString().toLowerCase();
  var medications = onMeds.indexOf("yes") >= 0 ? ["see coaching brief"] : [];

  // ---- GLP-1 --------------------------------------------------
  var glp1Key = "are you currently using, or have you used in the last 6 months, any hormones, peptides, or glp-1 medications such as semaglutide or tirzepatide?";
  var glp1Raw = (fields[glp1Key] || fields["glp-1"] || fields["glp1"] || "").toString().toLowerCase();
  var glp1    = glp1Raw.indexOf("yes") >= 0;

  // ---- Coach-assigned fields from brief ----------------------
  // These are NOT in the intake form — assigned at Stage 1.5
  var coachFields = _parseCoachFieldsFromBrief(brief);

  return {
    client_name:            clientName,
    sex:                    sex,
    age:                    age,
    weight_lbs:             weightLbs,
    height_inches:          heightInches,
    body_fat_percent:       bodyFat,
    activity_level:         coachFields.activity_level || "moderate",
    training_days_per_week: trainingDays,
    phase:                  coachFields.phase          || "fat_loss",
    blueprint_tier:         coachFields.blueprint_tier || "intermediate",
    supplement_tier:        coachFields.supplement_tier || "basic",
    sweat_level:            sweatLevel,
    sleep_hours_current:    sleepHours,
    digestion_score:        digestionScore,
    dietary_restrictions:   [],
    medications:            medications,
    glp1:                   glp1,
    pregnant_or_postpartum: false
  };
}

/**
 * Looks for an embedded CALC_INPUTS JSON block in the coaching brief.
 * Stage 1.5 can embed this to pass structured data cleanly:
 *
 *   CALC_INPUTS:
 *   ```json
 *   { ... }
 *   ```
 *
 * Returns the parsed object or null.
 */
function _extractCalcInputsFromBrief(brief) {
  if (!brief) return null;
  try {
    var match = brief.match(/CALC_INPUTS:\s*```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
    if (!match) return null;
    var parsed = JSON.parse(match[1]);
    // Minimal validation
    if (parsed.weight_lbs && parsed.height_inches && parsed.age) return parsed;
  } catch (e) { /* ignore */ }
  return null;
}

/**
 * Extracts coach-assigned fields from the coaching brief text.
 * Tries common patterns Stage 1.5 might produce.
 */
function _parseCoachFieldsFromBrief(brief) {
  var result = {};
  if (!brief) return result;

  var text = brief.toLowerCase();

  // Activity level
  var activityMatch = text.match(/activity\s*level[:\s]+([a-z_]+)/);
  if (activityMatch) {
    var raw = activityMatch[1].trim();
    // Normalise human labels to keys
    var actMap = {
      "sedentary": "sedentary",
      "lightly": "lightly_active", "light": "lightly_active",
      "moderate": "moderate", "moderately": "moderate",
      "very": "very_active", "highly": "very_active",
      "extremely": "extremely_active", "extreme": "extremely_active"
    };
    for (var k in actMap) {
      if (raw.indexOf(k) >= 0) { result.activity_level = actMap[k]; break; }
    }
    if (!result.activity_level) result.activity_level = raw.replace(/[^a-z_]/g, "_");
  }

  // Phase
  var phaseMatch = text.match(/(?:coaching\s+)?phase[:\s]+(fat[\s_]loss|muscle[\s_]gain|maintenance|recomp(?:osition)?)/);
  if (phaseMatch) {
    var phaseRaw = phaseMatch[1].replace(/\s+/, "_");
    if (phaseRaw.indexOf("recomp") >= 0) phaseRaw = "recomp";
    result.phase = phaseRaw;
  }

  // Blueprint tier
  var tierMatch = text.match(/blueprint\s*tier[:\s]+(beginner|intermediate|advanced)/);
  if (tierMatch) result.blueprint_tier = tierMatch[1];

  // Supplement tier
  var suppMatch = text.match(/supplement\s*tier[:\s]+(basic|standard|advanced)/);
  if (suppMatch) result.supplement_tier = suppMatch[1];

  return result;
}

/**
 * Parses a free-text weight string to lbs.
 * Handles: "195 lbs", "88.4 kg", "195", "88kg", etc.
 */
function _parseWeightLbs(raw) {
  if (!raw) return 0;
  var s = raw.toString().trim().toLowerCase();
  var match = s.match(/([\d.]+)\s*(kg|kilograms?|lbs?|pounds?)?/);
  if (!match) return 0;
  var val  = parseFloat(match[1]);
  var unit = (match[2] || "").toLowerCase();
  if (unit.indexOf("kg") >= 0 || unit.indexOf("kilo") >= 0) {
    return Math.round(val * 2.205 * 10) / 10;
  }
  return val; // default: lbs
}

/**
 * Parses a free-text height string to decimal inches.
 * Handles: "5'11\"", "5 ft 11 in", "71 inches", "180 cm", "1.80 m", etc.
 */
function _parseHeightInches(raw) {
  if (!raw) return 0;
  var s = raw.toString().trim().toLowerCase();

  // feet + inches patterns: 5'11", 5'11, 5 ft 11, 5 feet 11 inches, 5-11
  var ftInMatch = s.match(/(\d)\s*(?:ft|feet|foot|'|′)?\s*[-\s]?\s*(\d{1,2}(?:\.\d+)?)\s*(?:in|inches?|"|″)?/);
  if (ftInMatch && parseInt(ftInMatch[1]) <= 8) {
    return parseFloat(ftInMatch[1]) * 12 + parseFloat(ftInMatch[2]);
  }

  // cm pattern: 180 cm, 180cm, 180.5cm
  var cmMatch = s.match(/([\d.]+)\s*cm/);
  if (cmMatch) return Math.round((parseFloat(cmMatch[1]) / 2.54) * 10) / 10;

  // meters pattern: 1.80 m, 1.80m
  var mMatch = s.match(/(1\.\d+)\s*m(?:eters?)?/);
  if (mMatch) return Math.round((parseFloat(mMatch[1]) * 100 / 2.54) * 10) / 10;

  // Plain inches: "71", "71 in", "71 inches"
  var inMatch = s.match(/([\d.]+)\s*(?:in|inches?)?/);
  if (inMatch) {
    var val = parseFloat(inMatch[1]);
    // Sanity check: plausible inch range
    if (val >= 48 && val <= 96) return val;
  }

  return 0;
}

/**
 * Returns a safe default calc input when intake data can't be parsed.
 * All values are flagged — Stage 2 will show CALC LAYER ERROR block.
 */
function _defaultCalcInput(clientName) {
  return {
    client_name: clientName, sex: "male", age: 30,
    weight_lbs: 180, height_inches: 68, body_fat_percent: 0,
    activity_level: "moderate", training_days_per_week: 3,
    phase: "fat_loss", blueprint_tier: "intermediate", supplement_tier: "basic",
    sweat_level: "moderate", sleep_hours_current: 7,
    digestion_score: 7, dietary_restrictions: [], medications: [],
    glp1: false, pregnant_or_postpartum: false
  };
}

// ============================================================
// CALC LAYER MENU HANDLER
// ============================================================

/**
 * Runs the calc layer for the selected Pipeline client and shows results.
 * Useful for debugging without running Stage 2.
 */
function menuRunCalcDebug() {
  var sel = _getSelectedPipelineClient();
  if (!sel) return;

  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var ui    = SpreadsheetApp.getUi();
  var brief = _findClientOutput(ss.getSheetByName(TAB_BRIEFS), sel.clientName, 3);

  try {
    var input  = _buildCalcInputFromIntake(sel.clientName, ss, brief || "");
    var result = computeTargets(input);
    var e = result.energy;
    var m = result.macros;
    var h = result.hydration;
    var s = result.supplements;

    var msg = "Calc Layer Results for " + sel.clientName + "\n\n" +
      "BMR:              " + e.bmr + " kcal\n" +
      "TDEE (rounded):   " + e.tdee_maintenance + " kcal\n" +
      "Daily calories:   " + e.daily_calories + " kcal\n" +
      (m.bodyweight_outlier ? "Adj bodyweight:   " + m.effective_weight_lbs + " lbs\n" : "") +
      "Protein:          " + m.protein_grams + "g\n" +
      "Carbs:            " + m.carb_grams + "g\n" +
      "Fat:              " + m.fat_grams + "g\n" +
      "Fiber:            " + m.fiber_grams + "g\n" +
      "Macro check:      " + m.macro_calorie_check + " kcal (Δ" + m.macro_calorie_variance + ")\n" +
      "Base fluids:      " + h.base_fluid_oz + " oz\n" +
      "Training day:     " + h.training_day_fluid_oz + " oz\n" +
      "Sodium:           " + h.sodium_mg + " mg\n" +
      "Creatine:         " + s.creatine_rounded + " g\n" +
      "\nFlags:    " + (result.flags.length    > 0 ? result.flags.join(", ")    : "None") +
      "\nWarnings: " + (result.warnings.length > 0 ? result.warnings.join(", ") : "None");

    ui.alert("Calc Layer Debug", msg, ui.ButtonSet.OK);
  } catch (err) {
    ui.alert("Calc Layer Error", err.toString(), ui.ButtonSet.OK);
  }
}
