/**
 * Google Apps Script Web App for lead capture.
 * Deploy as: Deploy > New deployment > Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the resulting Web App URL into script.js (GOOGLE_SCRIPT_URL).
 */

const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.firstName || '',
      data.lastName || '',
      data.state || '',
      data.fbclid || '',
      data.click_id || '',
      data.utm_source || '',
      data.utm_medium || '',
      data.utm_campaign || '',
      data.referrer || '',
      data.userAgent || '',
      data.ip || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Lead capture endpoint is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'First Name', 'Last Name', 'State', 'FBCLID', 'Click ID',
      'UTM Source', 'UTM Medium', 'UTM Campaign', 'Referrer', 'User Agent', 'IP'
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}
