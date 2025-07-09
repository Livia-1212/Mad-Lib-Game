// lambda.js
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
  "https://mad-lib-game.vercel.app", // real deployed frontend
  "https://mad-lib-game-464eojc5i-livia-1212s-projects.vercel.app" // Auto-generated preview domain
];


app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(bodyParser.json());

app.options("*", cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));


const DATA_FILE = "/tmp/submissions.json";

// POST /submit
app.post("/submit", (req, res) => {
  const newEntry = req.body;

  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(newEntry) + "\n");
    } else {
      fs.appendFileSync(DATA_FILE, JSON.stringify(newEntry) + "\n");
    }

    res.status(200).send("Submitted");
  } catch (error) {
    console.error("Failed to save submission:", error);
    res.status(500).send("Error saving submission");
  }
});


// GET /results
app.get("/results", (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.status(404).json({ error: "No data yet" });
  }

  const content = fs.readFileSync(DATA_FILE, "utf-8").trim();
  const allLines = content.split("\n").map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return {};
    }
  });

  const merged = allLines.reduce((acc, entry) => ({ ...acc, ...entry }), {});
  res.json(merged);
});

exports.handler = serverless(app, {
  request: (request, event) => {
    const stage = event?.requestContext?.stage;
    if (stage && request.path?.startsWith(`/${stage}`)) {
      request.path = request.path.replace(`/${stage}`, "") || "/";
    }
  }
});

exports.app = app;
