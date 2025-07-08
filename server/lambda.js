// lambda.js
const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const serverless = require('serverless-http');

const app = express();

app.use(cors({
  origin: '*', // Or restrict to your Vercel frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());

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
  const allLines = content.split("\n").map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return {};
    }
  });

  const merged = allLines.reduce((acc, entry) => ({ ...acc, ...entry }), {});
  res.json(merged);
});

exports.handler = serverless(app);
exports.app = app;
