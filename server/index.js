const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const serverless = require("serverless-http");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.13:5173",
  "https://mad-lib-game.vercel.app",
  "https://mad-lib-game-464eojc5i-livia-1212s-projects.vercel.app"
];

// Handle CORS preflight directly for AWS Lambda (before Express)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ← you can restrict to mad-lib-game.vercel.app later
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
};

// help AWS handle OPTIONS directly

const wrapped = serverless(app);

exports.handler = async (event, context) => {
  // Handle preflight CORS requests
  console.log("📍 Incoming raw path in handler:", event.rawPath || event.path || "(unknown)");

  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "CORS preflight OK" })
    };
  }

  console.log("🔍 Full event object:", JSON.stringify(event, null, 2));

  // 👇 this line MUST exist to handle all other requests
  return await wrapped(event, context);
};




// Apply middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Blocked by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

// App logic

let memorySubmissions = [];

app.post("/submit", (req, res) => {
  memorySubmissions.push(req.body);
  res.status(200).send("Stored in memory successfully");
});

app.get("/results", (req, res) => {
  res.json(memorySubmissions);
});
// const DATA_FILE = "/tmp/submissions.json";

// app.post("/submit", (req, res) => {
//   const newEntry = req.body;

//   try {
//     if (!fs.existsSync(DATA_FILE)) {
//       fs.writeFileSync(DATA_FILE, JSON.stringify(newEntry) + "\n");
//     } else {
//       fs.appendFileSync(DATA_FILE, JSON.stringify(newEntry) + "\n");
//     }

//     res.status(200).send("Submitted");
//   } catch (error) {
//     console.error("Failed to save submission:", error);
//     res.status(500).send("Error saving submission");
//   }
// });

// app.get("/results", (req, res) => {
//   if (!fs.existsSync(DATA_FILE)) {
//     return res.status(404).json({ error: "No data yet" });
//   }

//   const content = fs.readFileSync(DATA_FILE, "utf-8").trim();
//   const allLines = content.split("\n").map((line) => {
//     try {
//       return JSON.parse(line);
//     } catch {
//       return {};
//     }
//   });

//   const merged = allLines.reduce((acc, entry) => ({ ...acc, ...entry }), {});
//   res.json(merged);
// });

// Optional: export app for local testing
exports.app = app;
