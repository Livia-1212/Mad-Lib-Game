import React, { useState } from "react";
import axios from "axios";
import styles from "./App.module.css";



const API_BASE = import.meta.env.VITE_API_BASE;
console.log("🚀 VITE_API_BASE =", API_BASE);

const SWEETHEART_PASSWORD = import.meta.env.VITE_SWEETHEART_PASSWORD;

const TABLE_BLANKS = {
  "Table 1": [
    { id: 1, prompt: "Pick an adjective:", options: ["spicy", "bewildering", "awkward", "cozy", "whimsical", "glittery"] },
    { id: 2, prompt: "Pick a verb:", options: ["laughing", "overthinking", "dancing", "binge-watching", "loving", "cuddling"] }
  ],
  "Table 2": [
    { id: 3, prompt: "Pick one of the following:", options: ["surprises", "dishes", "plot twists", "mismatched socks", "adventures", "spreadsheets"] },
    { id: 4, prompt: "Pick an animal:", options: ["raccoons", "penguins", "alpacas", "hyenas", "cats", "kangaroos"] }
  ],
  "Table 3": [
    { id: 5, prompt: "Pick an adjective:", options: ["patient", "dramatic", "caffeinated", "loyal", "productive", "sleepy"] },
    { id: 6, prompt: "Pick a place:", options: ["IKEA", "Paris", "the dog park", "Costco", "a Zoom meeting", "Narnia"] }
  ],
  "Table 4": [
    { id: 7, prompt: "Pick a verb:", options: ["debate", "whisper", "stumble", "jump", "moonwalk", "faceplant"] },
    { id: 8, prompt: "Pick your favorite movie quote:", options: ["May the Force be with you.", "Penny! Penny! Penny!", "To infinity and beyond!", "I'll be back.", "A Lannister always pays his debts.", "I'm not superstitious, but I am a little stitious"] }
  ],
  "Table 5": [
    { id: 9, prompt: "Pick a food:", options: ["dumplings", "tater tots", "noodles", "cupcakes", "samosas", "cheese cubes"] },
    { id: 10, prompt: "Pick a verb:", options: ["hug", "snack", "nap", "Google it", "use ChatGPT", "text your therapist"] }
  ],
  "Sweetheart Table": [
    { id: 11, prompt: "Pick an emotion:", options: ["gratitude", "overoptimism", "adoration", "joy", "curiosity", "peace"] },
    { id: 12, prompt: "Pick an object:", options: ["pillow fight", "first-class plane ticket", "chewed-up sock Harper(Andrew & Livia's dog) refused to surrender", "to-do list", "inside joke", "your mom’s phone call"] }
  ],
  "Table 6": [
    { id: 13, prompt: "Pick a verb", options: ["slow dancing", "breathing", "procrastinating", "doing push-ups", "staring into space", "people-watching"] },
    { id: 14, prompt: "Pick one of the following:", options: ["3", "exactly 22.5", "20 thousand", "0", "square root of 31", "888"] }
  ],
  "Table 7": [
    { id: 15, prompt: "Pick one of the following:", options: ["Wi-Fi", "a good back massage", "3-ply toilet paper", "freshly laundered clothing", "powerful snowblower", "fried chicken"] },
    { id: 16, prompt: "Pick one of the following:", options: ["karaoke with closing arguments", "mock trial over who left the dishes", "closing arguments over closet space", 
      "cross-examining every dessert option at the new bakery.", "drafting a memorandum of understanding: You cook, I clean.", "filing of a motion to stay in pajamas until further notice"] }
  ]
};

function App() {
  const [authPassed, setAuthPassed] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [mergedAnswers, setMergedAnswers] = useState(null);

  const handleSelect = (word, id) => {
    setAnswers({ ...answers, [id]: word });
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_BASE}/submit`, answers, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      setSubmitted(true);

      if (selectedTable === "Sweetheart Table") {
        const res = await axios.get(`${API_BASE}/results`);
        setMergedAnswers(res.data);
        setShowLetter(true);
      }
    } catch (err) {
      console.error("Error submitting or fetching results:", err);
    }
  };

  if (!selectedTable) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          💌 Welcome to Livia & Andrew's Wedding Game
        </header>

        <h2 className={styles.subtitle}>Which table are you at?</h2>

        <div className={styles.grid}>
          {Object.keys(TABLE_BLANKS).map((table) => (
            <button
              key={table}
              onClick={() => {
                if (table === "Sweetheart Table") {
                  const pw = prompt("Enter the sweetheart table password:");
                  if (pw === SWEETHEART_PASSWORD) {
                    setAuthPassed(true);
                    setSelectedTable(table);
                  } else {
                    alert("Incorrect password.");
                  }
                } else {
                  setSelectedTable(table);
                }
              }}
              className={styles.tableButton}
            >
              {table}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const blanks = TABLE_BLANKS[selectedTable];
  const data = showLetter ? mergedAnswers : answers;

  if (submitted && showLetter && mergedAnswers) {
    return (
      <div className={styles.resultContainer}>
        <h2 className={styles.resultTitle}>💌 A Love Letter for Livia & Andrew</h2>
        <p className={styles.resultText}>
          Dear Livia and Andrew,<br /><br />
          Marriage is a(n) <strong>{data[1]}</strong> adventure, full of <strong>{data[2]}</strong> and unexpected <strong>{data[3]}</strong>.<br />
          Remember, even if you fight like <strong>{data[4]}</strong>, always stay <strong>{data[5]}</strong> and never go to bed angry—unless you’re in <strong>{data[6]}</strong>, in which case, just <strong>{data[7]}</strong> and yell "<strong>{data[8]}</strong>" into a pillow.<br /><br />
          Share plenty of <strong>{data[9]}</strong>, always <strong>{data[10]}</strong> before making big decisions, and keep your hearts full of <strong>{data[11]}</strong>.<br />
          Never forget the power of a good <strong>{data[12]}</strong>, and when in doubt, try <strong>{data[13]}</strong> for at least <strong>{data[14]}</strong> minutes.<br /><br />
          Also, never underestimate the importance of <strong>{data[15]}</strong>, or the occasional <strong>{data[16]}</strong> to keep things interesting.<br /><br />
          Wishing you a lifetime of laughter, love, and excellent snacks.<br /><br />
          Love,
          <strong> Your Family and Friends</strong>
        </p>
      </div>
    );
  }

  if (submitted) return <div className={styles.thankYou}>Thank you! Your response has been submitted 💌</div>;
  if (step >= blanks.length) return <button className={styles.submitButton} onClick={handleSubmit}>Submit</button>;

  const current = blanks[step];

  return (
    <div className={styles.stepContainer}>
      <h1 className={styles.prompt}>{current.prompt}</h1>
      <div className={styles.optionGrid}>
        {current.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt, current.id)}
            className={styles.optionButton}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;


