import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const SERVICE_ACCOUNT_FILE = path.join(__dirname, "../service-account.json");


const serviceAccountCredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const auth = new google.auth.GoogleAuth({
  // keyFile: SERVICE_ACCOUNT_FILE,
  credentials: serviceAccountCredentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME_CUT = "CUT";
const SHEET_NAME_ROLL = "ROLL";
const SHEET_NAME_FOLDER = "FOLDER";
const SHEET_NAME2 = "CATALOGUE LIST";
const SHEET_NAME3 = "COLOR NO";
const SHEET_NAME4 = "WIDTH";

export const getFilteredRows = async (req, res) => {
  const { contact } = req.params;

  // console.log(contact);

  try {
    // Order from CUT
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME_CUT,
    });

    const rows = result.data.values || [];

    // if (!rows || rows.length === 0) {
    //   return res.status(404).json({ message: "No data found." });
    // }

    const headers = rows[0];
    const contactIndex = headers.indexOf("MOBILE NO");

    if (contactIndex === -1) {
      return res.status(500).json({ message: "Contact no. column not found." });
    }

    const filteredRows = rows.slice(1)
      .filter((row) => row[contactIndex] === contact)
      .map((row) => ["CUT",...row]); // Add orderType "CUT"

    // if (filteredRows.length === 1) {
    //   return res.status(200).json({ message: "No Orders." });
    // }

    // Order from ROLL
    const result2 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME_ROLL,
    });

    const rows2 = result2.data.values || [];

    // if (!rows2 || rows2.length === 0) {
    //   return res.status(404).json({ message: "No data found." });
    // }

    const headers2 = rows2[0];
    const contactIndex2 = headers2.indexOf("MOBILE NO");

    if (contactIndex2 === -1) {
      return res.status(500).json({ message: "Contact no. column not found." });
    }

    const filteredRows2 = rows2.slice(1)
      .filter((row) => row[contactIndex2] === contact)
      .map((row) => ["ROLL",...row]); // Add orderType "ROLL"

    // if (filteredRows2.length === 0) {
    //   return res.status(200).json({ message: "No Orders." });
    // }


    const result3 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME_FOLDER,
    });

    const row3 = result3.data.values || [];
    const headers3 = row3[0];
    const contactIndex3 = headers3.indexOf("MOBILE NO");
    if (contactIndex3 === -1) {
      return res.status(500).json({ message: "Contact no. column not found." });
      }
      const filteredRows3 = row3.slice(1)
      .filter((row) => row[contactIndex3] === contact)
      .map((row) => ["FOLDER",...row]); // Add orderType "FOLDER"
      // if (filteredRows3.length === 0) {
      //   return res.status(200).json({ message: "No Orders." });
      // }


    // Combine both arrays
    const resultantRow = [...filteredRows, ...filteredRows2, ...filteredRows3];
    // console.log(resultantRow);

    res.json({ data: resultantRow });
  } catch (error) {
    console.error("Error reading Google Sheets:", error);
    res.status(500).json({ error: "Failed to read the Google Sheet." });
  }

};


export const getCatalogNames = async (req, res) => {
  try {

    // Catalog Fetching
    const CatalogSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME2,
    });

    const CatalogRows = CatalogSheet.data.values;

    if (!CatalogRows || CatalogRows.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }

    // Get headers from the first row
    const Catalogs = CatalogRows[0];



    // Colors Fetching
    // Fetch Colors
    const ColorSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME3,
    });

    const ColorRows = ColorSheet.data.values;

    if (!ColorRows || ColorRows.length <= 1) {
      return res.status(404).json({ message: "No color data found." });
    }

    const colorHeaders = ColorRows[0];
    const ColorRowIndex = colorHeaders.indexOf("COLOR NO");

    if (ColorRowIndex === -1) {
      return res.status(500).json({ message: "COLOR NO column not found." });
    }

    // Create a simple array of colors
    const Colors = ColorRows.slice(1).map((row) => row[ColorRowIndex]).filter(Boolean);

    // Fetch Widths
    const WidthSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME4,
    });

    const WidthRows = WidthSheet.data.values;

    if (!WidthRows || WidthRows.length <= 1) {
      return res.status(404).json({ message: "No width data found." });
    }

    const widthHeaders = WidthRows[0];
    const WidthRowIndex = widthHeaders.indexOf("WIDTH");

    if (WidthRowIndex === -1) {
      return res.status(500).json({ message: "WIDTH column not found." });
    }

    // Create a simple array of widths
    const Widths = WidthRows.slice(1).map((row) => row[WidthRowIndex]).filter(Boolean);



    res.json({ catalog: Catalogs, colors: Colors, width: Widths });
  } catch (error) {
    console.error("Error reading Google Sheets:", error);
    res.status(500).json({ error: "Failed to read the Google Sheet." });
  }
};
export const getQualityNames = async (req, res) => {
  const { catalog } = req.params;

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME2,
    });

    const rows = result.data.values;

    if (!rows || rows.length <= 1) {
      return res.status(404).json({ message: "No data found." });
    }

    // Get the headers (catalog names)
    const headers = rows[0];

    // Find the index of the requested catalog
    const catalogIndex = headers.indexOf(catalog);

    if (catalogIndex === -1) {
      return res.status(404).json({ message: "Catalog not found." });
    }

    // Create an array of quality data for the selected catalog
    const qualityData = rows.slice(1).map((row) => row[catalogIndex]).filter(Boolean);

    res.json({ data: qualityData });
  } catch (error) {
    console.error("Error reading Google Sheets:", error);
    res.status(500).json({ error: "Failed to read the Google Sheet." });
  }
};


