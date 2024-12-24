import express from 'express';
import bodyParser from "body-parser"
import cors from 'cors';
import cookieParser from "cookie-parser";
import orderRoute from "./routes/orderRoute.js"
import authRoute from "./routes/authRoute.js"
import connectionToDatabase from './database/databaseConnection.js';
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: ["http://localhost:5173","https://jsrprimesolution.com","https://orderflow.jsrprimesolution.com"],
  credentials: true
}))
app.options('*', cors()); // Allow all preflight requests
app.use(bodyParser.json());
app.use(cookieParser());
dotenv.config();
app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('/ping',(req,res)=>{
  res.send("OrderFlow Api")
})
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

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

  fetch('https://d-uploader.onrender.com/test')
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

// Ping the server every 2 minutes
setInterval(pingServer, 120000);


// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  connectionToDatabase();
  console.log(`Server is running on http://localhost:${PORT}`);
});
