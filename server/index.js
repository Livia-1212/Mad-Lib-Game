const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand
} = require("@aws-sdk/client-s3");
const serverless = require("serverless-http");

const app = express();

const BUCKET_NAME = "mad-lib-upload-bucket";
const REGION = "us-east-1";

const s3 = new S3Client({ region: REGION });

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.13:5173",
  "https://mad-lib-game.vercel.app",
  "https://mad-lib-game-464eojc5i-livia-1212s-projects.vercel.app"
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
};

// 👇 Lambda-specific entry point
const wrapped = serverless(app, {
  request: (req, event) => {
    req.url = event.rawPath || event.path || "/";
    console.log("🧭 Set req.url to:", req.url);
  },
  response: (res) => {
    console.log("🧾 Wrapped result returned to Lambda:", res);
    return res;
  }
});

exports.handler = async (event, context) => {
  
  console.log("📦 Livia set up debug Incoming Event:", JSON.stringify(event, null, 2));

  // ✅ CORS Preflight
  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "CORS preflight OK" })
    };
  }

  // ✅ Log rawPath only — no need to normalize
  const result = await wrapped(event, context);
  console.log("🧾 Wrapped result returned to Lambda:", result);

  return result;
};

// 👉 Express Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Blocked by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(bodyParser.json());

/** 🔽 POST /submit — Upload to S3 */
app.post("/submit", async (req, res) => {
  let newEntry;

  // 🧠 Handle the case where req.body is a Buffer
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
    newEntry = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error("❌ Failed to parse newEntry:", err.message);
    return res.status(400).json({ error: "Invalid JSON submission." });
  }

  try {
    const fileKey = "submission.json";
    let existingData = {};

    // Step 1: Try to read the existing file from S3
    try {
      const getCmd = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey
      });

      const data = await s3.send(getCmd);
      const body = await streamToString(data.Body);
      existingData = JSON.parse(body); // existing data is a flat object
    } catch (err) {
      if (err.name === "NoSuchKey") {
        console.log("🆕 No existing submission.json found. Creating new.");
      } else {
        console.error("❌ Failed to read existing submission:", err);
        return res.status(500).json({ error: "Failed to read existing submission." });
      }
    }

    // Step 2: Merge newEntry into existingData (new keys overwrite old)
    const mergedData = { ...existingData, ...newEntry };
    const body = JSON.stringify(JSON.parse(JSON.stringify(mergedData)), null, 2);

    // Step 3: Save merged data back to S3
    const putCmd = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: body,
      ContentType: "application/json"
    });

    await s3.send(putCmd);
    console.log("✅ Updated submission.json with merged data.");
    res.status(200).json({ message: "Submission merged and stored in S3." });
  } catch (error) {
    console.error("❌ S3 Upload Error:", error);
    res.status(500).send("Failed to upload to S3.");
  }
});

/** 🔽 GET /results — Read recent S3 files and merge */
app.get("/results", async (req, res) => {
  try {
    const listCmd = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
    const listed = await s3.send(listCmd);

    if (!listed.Contents || listed.Contents.length === 0) {
      return res.status(404).json({ error: "No submissions found." });
    }

    const allData = [];

    for (const obj of listed.Contents) {
      if (!obj.Key.endsWith(".json")) {
        console.log(`⏭️ Skipping non-JSON file: ${obj.Key}`);
        continue;
      }

      console.log("📄 Reading:", obj.Key);

      const getCmd = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: obj.Key
      });

      try {
        const result = await s3.send(getCmd);
        const bodyContents = await streamToString(result.Body);

        const json = JSON.parse(bodyContents);
        allData.push(json);
      } catch (parseErr) {
        console.error(`❌ Failed to read/parse ${obj.Key}:`, parseErr.message);
      }
    }

    const merged = allData.reduce((acc, entry) => ({ ...acc, ...entry }), {});
    console.log("✅ Merged Result:", merged);
    res.json(merged);
  } catch (err) {
    console.error("❌ Failed to read from S3:", err);
    res.status(500).json({ error: "Failed to fetch results from S3." });
  }
});

/** 🔁 Convert stream to string (for S3 body) */
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    let data = "";
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => data += chunk);
    stream.on("end", () => resolve(data));
    stream.on("error", reject);
  });
}


// ✅ Export for local testing
exports.app = app;
