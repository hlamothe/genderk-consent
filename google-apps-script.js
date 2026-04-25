/**
 * Google Apps Script — GenderK Consent Form Backend
 * 
 * This script receives POST requests from the online consent form
 * and appends the data as a new row in the active Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this entire file into the script editor (replace any existing code)
 * 4. Click Deploy > New deployment
 * 5. Select type: "Web app"
 * 6. Set "Execute as": Me
 * 7. Set "Who has access": Anyone
 * 8. Click Deploy and authorize
 * 9. Copy the Web app URL and paste it into script.js (GOOGLE_SCRIPT_URL)
 */

// Column headers — these will be auto-created on the first submission
const HEADERS = [
  'Timestamp',
  'Child Name',
  'Child DOB',
  'Child Gender',
  'Parent Name',
  'Consent Date',
  'Video: Private Use',
  'Video: Scientific Use',
  'Video: Public Use',
  'Signature (base64)'
];

/**
 * Handle POST requests from the consent form
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      // Bold the header row
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      // Freeze header row
      sheet.setFrozenRows(1);
    }
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Append row
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.childName || '',
      data.childDOB || '',
      data.childGender || '',
      data.parentName || '',
      data.parentDate || '',
      data.videoConsentPrivate || '',
      data.videoConsentScientific || '',
      data.videoConsentPublic || '',
      data.signatureData || ''
    ]);
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'ok', 
      message: 'GenderK consent form backend is running.' 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
