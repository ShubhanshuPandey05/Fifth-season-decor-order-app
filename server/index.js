import express from 'express';
import bodyParser from "body-parser"
import cors from 'cors';
import cookieParser from "cookie-parser";
import orderRoute from "./routes/orderRoute.js"
import authRoute from "./routes/authRoute.js"
import connectionToDatabase from './database/databaseConnection.js';
import dotenv from "dotenv";

const app = express();
app.use(cors({
  origin: ["http://localhost:5173","https://jsrprimesolution.com","https://orderflow.jsrprimesolution.com"],
  credentials: true
}))
app.options('*', cors()); // Allow all preflight requests
app.use(bodyParser.json());
app.use(cookieParser());
dotenv.config();

// Endpoint to update spreadsheet
// app.post("/update-spreadsheet", async (req, res) => {
//   try {
//     // Authenticate and create a Sheets API client
//     const client = await auth.getClient();
//     const sheets = google.sheets({ version: "v4", auth: client });

//     // Get data from request body
//     const { customerName, items } = req.body; // Example: { values: [["Order123", "John Doe", "Product A", "100"]] }

//     const rows = items.map((item) => [
//       new Date().toLocaleDateString(), // Date
//       new Date().toLocaleTimeString(), // Time
//       "", // Customer ID (leave empty for now)
//       customerName, // Customer Name
//       item.name, // Item Name
//       item.quantity, // Quantity
//       item.rate || "", // Rate (optional)
//       item.amount || "", // Amount (optional)
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
//         values:rows, // Data to append
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
// });

app.get('/',(req,res)=>{
  res.send("OrderFlow Api")
})

app.use("/api/",orderRoute)
app.use("/api/auth/",authRoute)

function pingServer() {
  fetch('https://formsflow.onrender.com/')
      .then(response => {
          if (response.ok) {
              console.log('Server is reachable');
          } else {
              console.error('Server responded with an error:', response.status);
          }
      })
      .catch(error => {
          console.error('Error pinging the server:', error);
      });
}

// Ping the server every 30 seconds
setInterval(pingServer, 30000);


// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  connectionToDatabase();
  console.log(`Server is running on http://localhost:${PORT}`);
});
