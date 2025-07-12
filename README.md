# 💌 Livia & Andrew's Wedding Mad Libs Game

A Mad Libs–style game built for our wedding
Guests at different tables scan a QR code, answer playful prompts, and contribute to a one-of-a-kind love letter — revealed at the sweetheart table.

---

## ✨ Features

- 🎯 Table-specific question flow (supports 7 tables + sweetheart table)
- 💡 16 creative, customizable blanks (adjectives, verbs, objects, etc.)
- 💌 Auto-generates a personalized letter from guest responses
- 📱 Mobile-friendly, no install required
- 🧼 Simple to deploy and easy to adapt for other occasions

---

## 🔧 Tech Stack

| Layer        | Tech                                    |
|--------------|-----------------------------------------|
| **Frontend** | React, Vite, CSS Modules                |
| **Backend**  | Node.js, Express, AWS Lambda            |
| **Storage**  | Amazon S3 bucket                        |
| **Hosting**  | Vercel (frontend), Lambda (backend)     |
| **Dev Tools**| Git, VS Code, React DevTools, QR utils  |

---

## 🚀 How It Works

1. Guest opens the game and selects their table.
2. They are guided through two fun prompts.
3. Their answers are submitted via API to the backend.
4. The **Sweetheart Table** has a password to unlock the final letter.
5. Final letter is composed from all merged entries and displayed in a heartfelt, funny paragraph.

---

## 🧠 S3 Data Design

- All submissions are merged into one file: `submission.json`
- On every `POST /submit`, new answers are merged with existing ones
- Duplicate keys (e.g. same prompt ID) will **overwrite** older ones
- On `GET /results`, the merged data is returned as a flat object

---

## 🧼 Deployment Notes

### 🔐 Environment Variables

Frontend uses:
```env
VITE_API_BASE=https://your-lambda-url.amazonaws.com
VITE_SWEETHEART_PASSWORD=your-secret-password
```

### 🔁 Local Development

```bash
cd frontend
npm install
npm run dev
```
In server/, use serverless-http and zip-based AWS Lambda deployment.

### 🪄 Rebuild and Upload Backend
- When backend changes:
- Zip the server/ contents (excluding node_modules)
- Upload to Lambda function via AWS Console

-- Test with:
```
curl -X POST https://your-lambda-url.amazonaws.com/submit \
  -H "Content-Type: application/json" \
  -d '{ "1": "spicy", "2": "dancing" }'
```


## 🛠 Developer Notes

This app was crafted to bring smiles and connection to our special day.  
But the architecture is reusable for:

- Birthday party Mad Libs
- Baby showers
- Inside-joke generator games
- Storytelling workshops
- Classroom or event icebreakers

---

## 📂 License

MIT License — feel free to use, adapt, and remix.  
🥂

---

Made with 💖 for our family and friends.