import { google } from "googleapis"
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();


// Get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account key file
// const SERVICE_ACCOUNT_FILE = path.join(__dirname, "../service-account.json");

// Spreadsheet ID and range to update
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = "Sheet1";

// Authenticate with the Google API using Service Account
const serviceAccountCredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const auth = new google.auth.GoogleAuth({
  // keyFile: SERVICE_ACCOUNT_FILE,
  credentials: serviceAccountCredentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});


// export const updateOrder = async (req, res) => {
//   try {
//     // Authenticate and create a Sheets API client
//     const client = await auth.getClient();
//     const sheets = google.sheets({ version: "v4", auth: client });

//     // Get data from request body
//     const currentDate = new Date();
//     const { companyName, contactNo, customerName, items, dispatchThrough, dueDays, orderNote } = req.body; // Example: { values: [["Order123", "John Doe", "Product A", "100"]] }
//     const deliveryDate = new Date();
//     deliveryDate.setDate(currentDate.getDate() + parseInt(dueDays || 0));
//     console.log(companyName);

//     let formattedDeliveryDate = "";
//     if(dueDays > 0){
//       formattedDeliveryDate = deliveryDate.toLocaleDateString();
//     }

//     const options = {
//       timeZone: 'Asia/Kolkata', // IST time zone
//       hour12: true, // Optional, for 12-hour format
//     };

//     const rows = items.map((item) => [
//       new Date().toLocaleDateString('en-IN', options), // Date
//       new Date().toLocaleTimeString('en-IN', options), // Time
//       companyName,
//       customerName, // Customer Name
//       contactNo, // Customer ID (leave empty for now)
//       item.name, // Item Name
//       item.itemNote||"",
//       item.unit || "Unit",
//       item.quantity, // Quantity
//       item.rate || "", // Rate (optional)
//       item.amount || "", // Amount (optional)
//       dispatchThrough, // Dispatch Through
//       formattedDeliveryDate,
//       dueDays,
//       orderNote,
//       "Pending"
//     ]);

//     if (!rows || !Array.isArray(rows)) {
//       return res.status(400).json({ error: "Invalid or missing 'values' array" });
//     }

//     // Update the spreadsheet
//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId: SPREADSHEET_ID,
//       range: RANGE, // Where to append data
//       valueInputOption: "RAW", // "RAW" or "USER_ENTERED"
//       insertDataOption: "INSERT_ROWS",
//       requestBody: {
//         values: rows, // Data to append
//       },
//     });

//     res.status(200).json({
//       message: "Spreadsheet updated successfully",
//       response,
//     });
//   } catch (error) {
//     console.error("Error updating spreadsheet:", error);
//     res.status(500).json({ error: error.message });
//   }
// };



export const updateOrder = async (req, res) => {
  try {
    // Authenticate and create a Sheets API client
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Get data from request body
    const currentDate = new Date();
    const {
      companyName,
      contactNo,
      customerName,
      state,
      city,
      items,
      dispatchThrough,
      dueDays,
      orderNote,
      orderType, // CUT or ROLL
      deliveryTo,
      deliveryAddress,
      poNo
    } = req.body;

    // const deliveryDate = new Date();
    // deliveryDate.setDate(currentDate.getDate() + parseInt(dueDays || 0));

    // let formattedDeliveryDate = "";
    // if (dueDays > 0) {
    //   formattedDeliveryDate = deliveryDate.toLocaleDateString();
    // }


    const options = {
      timeZone: "Asia/Kolkata", // IST time zone
      hour12: true,
    };

    // Determine the sheet name based on orderType
    const SHEET_NAME = orderType === "CUT" ? "CUT" : orderType === "ROLL" ? "ROLL" : "FOLDER";

    // Fetch existing rows to determine the next SR NO
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!C:C`, // Get the SR NO column
    });

    const existingRows = getResponse.data.values || [];
    let lastSRNo = 0;

    if (existingRows.length > 1) {
      // Get the last SR NO and timestamp from the last row
      const lastRow = existingRows[existingRows.length - 1];
      lastSRNo = parseInt(lastRow[0]) || 0; // SR NO is in the third column (index 2)
    } // Next SR NO (assuming header is in the first row)

    // console.log(existingRows,"hii");
    // console.log(existingRows[existingRows.length - 1]);
    

    // console.log(lastSRNo);

    const srNo = lastSRNo + 1;

    // Format each item into a row
    const rows = items.map((item) => {
      srNo; // Increment SR NO for each item
      return [
        new Date().toLocaleDateString("en-IN", options), // Date
        new Date().toLocaleTimeString("en-IN", options), // Time
        srNo, // SR NO
        poNo,
        companyName, // COMPANY NAME
        city, // CITY/TOWN
        state, // STATE
        contactNo,
        customerName,
        item.name || "", // CATALOGUE NAME
        item.quality, // QUALITY
        item.clrNo || "", // Colour SR NO
        item.width || "", // WIDTH
        item.quantity || "", // QTY
        item.unit || "Mtr", // Unit
        item.rate || "", // Rate
        item.amount || "", // Amount
        dispatchThrough, // MODE OF DISPATCH
        deliveryTo,
        deliveryAddress,
        orderNote,// Order Note
        "Pending", // Order Status
      ];
    });

    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: "Invalid or missing 'values' array" });
    }

    // Update the appropriate sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME, // Append to the determined sheet (CUT or ROLL)
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: rows,
      },
    });

    res.status(200).json({
      message: `Spreadsheet updated successfully in ${SHEET_NAME} sheet`,
      response,
    });
  } catch (error) {
    console.error("Error updating spreadsheet:", error);
    res.status(500).json({ error: error.message });
  }
};