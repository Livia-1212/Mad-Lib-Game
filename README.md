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

| Layer       | Tech                              |
|-------------|-----------------------------------|
| **Frontend**  | React, Vite, CSS Modules           |
| **Backend**   | Node.js, Express, serverless-http |
| **Hosting**   | Vercel (frontend), AWS Lambda, S3 (backend) |
| **Dev Tools** | Git, QRCode-Terminal, PM2 (local dev) |

---

## 🚀 How It Works

1. Guest scans a QR code and selects their table.
2. They are guided through two fun prompts.
3. Their input is submitted to the backend via API.
4. The sweetheart table triggers the final **merged love letter** using all collected answers.

---

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
