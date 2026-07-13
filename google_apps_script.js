// ==============================================================================
// GOOGLE APPS SCRIPT FOR MARBLE WEBSITE ADMIN PANEL
// ==============================================================================
// 
// INSTRUCTIONS FOR SETUP:
// 1. Go to Google Drive and create a new Google Sheet. Name it "Marble Website Data".
// 2. Rename "Sheet1" to "Products" (exactly like that, case-sensitive).
// 3. Add a new sheet and name it "Collections" (exactly like that).
// 4. In the "Products" sheet, create headers in Row 1: 
//    ID | Title | Category | Price | Description | Image URL | Date Added
// 5. In the "Collections" sheet, create headers in Row 1:
//    Title | Description | Category | Image URL | Date Added
// 6. In the Google Sheet menu, click Extensions > Apps Script.
// 7. Delete any code there and PASTE ALL THE CODE BELOW into the editor.
// 8. Save the file (Ctrl+S or Cmd+S).
// 9. Now, we need a folder in Google Drive to store images. 
//    Go to Google Drive, create a folder named "WebsiteImages".
//    Right-click the folder > Share > General Access: change to "Anyone with the link".
//    Look at the URL in your browser. It looks like: drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
//    Copy that Folder ID.
// 10. REPLACE 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE' below with your actual Folder ID.
// 11. Click "Deploy" > "New deployment" at the top right.
// 12. Click the gear icon next to "Select type" and choose "Web app".
// 13. Set "Execute as" to "Me".
// 14. Set "Who has access" to "Anyone" (This is crucial, or the website can't talk to it).
// 15. Click Deploy. (You may need to "Authorize access" -> choose your account -> Advanced -> Go to script (unsafe)).
// 16. Copy the "Web app URL".
// 17. Paste that URL into your `admin.js` and `script.js` files where it says `GOOGLE_APP_SCRIPT_URL`.

const FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE'; // REPLACE THIS!

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // Save image to Google Drive
    const imageBlob = Utilities.newBlob(Utilities.base64Decode(data.image), data.mimeType, data.filename);
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(imageBlob);
    
    // IMPORTANT: To make the image viewable on a website directly, we construct a specific URL
    const fileId = file.getId();
    const imageUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const date = new Date().toISOString().split('T')[0];

    if (action === 'addProduct') {
      const sheet = ss.getSheetByName('Products');
      // Append row matching the headers: ID | Title | Category | Price | Description | Image URL | Date Added
      sheet.appendRow([
        data.id,
        data.title,
        data.category,
        data.price,
        data.description,
        imageUrl,
        date
      ]);
    } else if (action === 'addCollection') {
      const sheet = ss.getSheetByName('Collections');
      // Append row matching headers: Title | Description | Category | Image URL | Date Added
      sheet.appendRow([
        data.title,
        data.description,
        data.category,
        imageUrl,
        date
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved', imageUrl: imageUrl }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get Products
    const prodSheet = ss.getSheetByName('Products');
    const prodData = prodSheet.getDataRange().getValues();
    const products = [];
    // Skip header row
    for(let i = 1; i < prodData.length; i++) {
       if(prodData[i][0]) { // If ID exists
         products.push({
           id: prodData[i][0],
           title: prodData[i][1],
           category: prodData[i][2],
           price: prodData[i][3],
           description: prodData[i][4],
           imageUrl: prodData[i][5],
           date: prodData[i][6]
         });
       }
    }
    
    // Get Collections
    const colSheet = ss.getSheetByName('Collections');
    const colData = colSheet.getDataRange().getValues();
    const collections = [];
    for(let i = 1; i < colData.length; i++) {
       if(colData[i][0]) { // If Title exists
         collections.push({
           title: colData[i][0],
           description: colData[i][1],
           category: colData[i][2],
           imageUrl: colData[i][3],
           date: colData[i][4]
         });
       }
    }
    
    const result = {
      products: products,
      collections: collections
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

