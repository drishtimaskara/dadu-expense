import { useEffect, useState } from "react";
import API from "../services/api";
import { PieChart, Pie, Cell, Tooltip, Legend,} from "recharts";
import SpeechRecognition, { useSpeechRecognition,} from "react-speech-recognition";
import { useNavigate } from "react-router-dom";
import BillScanner from "../components/BillScanner";

const COLORS = [
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#a855f7", // purple
  "#14b8a6", // teal
  "#f97316", // orange
  ];
  const getColorForCategory = (categoryName) => {
  const colorMap = {
    Food: "#ef4444",
    Travel: "#3b82f6",
    Shopping: "#f59e0b",
    Grocery: "#10b981",
    Medical: "#a855f7",
    Bills: "#06b6d4",
    Rent: "#6366f1",
    Education: "#14b8a6",
    Entertainment: "#f97316",
    Electronics: "#8b5cf6",
    "Personal Care": "#ec4899",
    Fitness: "#22c55e",
    Pets: "#84cc16",
    Gifts: "#f43f5e",
    Toys: "#eab308",
    Insurance: "#0ea5e9",
    Investment: "#64748b",
    Home: "#d97706",
    Repairs: "#ef4444",
    Subscriptions: "#06b6d4",
    Banking: "#4f46e5",
    Charity: "#f97316",
    Kids: "#ec4899",
    Wedding: "#f43f5e",
    Festival: "#f59e0b",
    Office: "#3b82f6",
    Laundry: "#10b981",
    Parking: "#6366f1",
    Fine: "#ef4444",
    Tax: "#64748b",
    Vacation: "#14b8a6",
    Dating: "#ec4899",
    Other: "#9ca3af",
  };

  return colorMap[categoryName] || "#9ca3af";
};

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [categories, setCategories] = useState([]);


  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const { transcript, browserSupportsSpeechRecognition,resetTranscript,listening,} =
    useSpeechRecognition();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);

  // 🔊 TEXT TO SPEECH FUNCTION
 
  const speakText = (text) => {
  if (!text) return;

  if (!window.speechSynthesis) {
    alert("Speech not supported in this browser");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "en-IN";
  utterance.rate = 1;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    utterance.voice = voices[0];
  }

  window.speechSynthesis.speak(utterance);
};
useEffect(() => {
  window.speechSynthesis.getVoices();
}, []);

  // 📊 FETCH EXPENSES
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setExpenses(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 📊 FETCH SUMMARY
  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/expenses/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSummary(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 📊 FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/expenses/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = response.data.map((item) => ({
        name: item.category,
        value: Number(item.total),
      }));

      setCategories(formatted);
    } catch (error) {
      console.log(error);
    }
  };

  // ➕ ADD EXPENSE
  const handleAddExpense = async () => {
    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/expenses",
        { amount, category, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // reset form
      setAmount("");
      setCategory("");
      setDescription("");

      fetchExpenses();
      fetchSummary();
      fetchCategories();

      // 🔊 speak confirmation
      speakText(
        `Expense added. ${amount} rupees for ${category}.`
      );
    } catch (error) {
      console.log(error);
    }
  };

  // ❌ DELETE EXPENSE
  const deleteExpense = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await API.delete(`/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchExpenses();
      fetchSummary();
      fetchCategories();

      speakText("Expense deleted");
    } catch (error) {
      console.log(error);
    }
  };

function wordsToNumber(text) {
  if (!text) return 0;

  text = text.toLowerCase();

  // 1. FIX speech noise
  text = text.replace(/hundret|hudred|hundreds/g, "hundred");
  text = text.replace(/tousand|thousend|thousan/g, "thousand");
  text = text.replace(/lakhs/g, "lakh");
  text = text.replace(/crores/g, "crore");

  // 2. remove useless words (IMPORTANT: remove everything non-number related)
  text = text.replace(
    /\b(spent|spend|rupees|rs|on|for|worth|around|about|chips|house|pant|paint)\b/g,
    " "
  );

  text = text.replace(/\s+/g, " ").trim();

  // 3. KEEP ONLY NUMBER-RELATED WORDS (THIS IS THE KEY FIX)
  const allowed = new Set([
    "zero","one","two","three","four","five","six","seven","eight","nine",
    "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen",
    "seventeen","eighteen","nineteen",
    "twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety",
    "hundred","thousand","lakh","crore",
    "million","billion"
  ]);

  let tokens = text.split(/\s+/);

  tokens = tokens.filter(t =>
    !t || !isNaN(t) || allowed.has(t)
  );

  if (tokens.length === 0) return 0;

  // 4. conversion maps
  const wordMap = {
    zero: 0, one: 1, two: 2, three: 3, four: 4,
    five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13,
    fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19,
    twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  };

  const scaleMap = {
    hundred: 100,
    thousand: 1000,
    lakh: 100000,
    crore: 10000000,
    million: 1000000,
    billion: 1000000000,
  };

  let total = 0;
  let current = 0;

  for (let token of tokens) {
    if (!token) continue;

    // direct number
    if (!isNaN(token)) {
      current += Number(token);
      continue;
    }

    // word number
    if (wordMap[token] !== undefined) {
      current += wordMap[token];
      continue;
    }

    // scale
    if (scaleMap[token]) {
      if (current === 0) current = 1;

      current = current * scaleMap[token];
      total += current;
      current = 0;
    }
  }

  return total + current;
}

function extractNumberPhrase(text) {
  const numberPattern =
    /\b(\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|lakh|crore|million|billion)\b/g;

  const matches = text.match(numberPattern);
  return matches ? matches.join(" ") : "";
}

  // 🎤 FILL FORM FROM VOICE
 const fillExpenseFromVoice = async () => {
  
  let text = transcript.toLowerCase().trim();
  text = text.replace(/rupees|rs\.?|spent|spend|for|on/g, "");
  if (!text) return;

  // 🔢 Extract amount (supports 100, ₹100, 100 rupees)
    // 🔢 CLEAN + EXTRACT ONLY NUMBER PART
let cleanedText = transcript.toLowerCase();

// remove only useless words (NOT chips/house/etc)
cleanedText = cleanedText.replace(
  /\b(spent|spend|rupees|rs\.?|for|on)\b/g,
  " "
);

// extract ONLY number-related words/numbers
let numberPhrase = extractNumberPhrase(cleanedText);

let extractedAmount = 0;

if (numberPhrase) {
  extractedAmount = wordsToNumber(numberPhrase);
} else {
  const match = cleanedText.match(/\d+/);
  if (match) extractedAmount = Number(match[0]);
}

  // 🧠 Detect category from keywords
  let detectedCategory = "Other";

 const categoryMap = [
  {
    name: "Food",
    keywords: [
      "food","dinner","lunch","breakfast","canteen","restaurant",
      "pizza","burger","sandwich","fries","pasta","biryani",
      "ice cream","cake","coffee","tea","juice","snacks",
      "dominos","mcdonald","kfc","subway","zomato","swiggy",
      "fruits","vegetables","chocolate","candy","chips","bakery"
    ],
  },

  {
    name: "Travel",
    keywords: [
      "bus","train","metro","uber","ola","taxi","cab",
      "auto","rickshaw","flight","airport","travel",
      "petrol","diesel","fuel","parking","toll",
      "bike ride","car ride","railway"
    ],
  },

  {
    name: "Shopping",
    keywords: [
      "shopping","mall","amazon","flipkart","meesho",
      "myntra","ajio","purchase","order",
      "clothes","dress","shirt","jeans","jacket",
      "shoes","watch","bag","wallet","accessories"
    ],
  },

  {
    name: "Grocery",
    keywords: [
      "grocery","supermarket","milk","bread","rice",
      "atta","dal","oil","eggs","ration","vegetables",
      "fruits","groceries","market","store","vegetable"
    ],
  },

  {
    name: "Medical",
    keywords: [
      "doctor","hospital","medicine","tablet","pharmacy",
      "clinic","checkup","medical","treatment","health",
      "surgery","test","xray","blood test","medicines"
    ],
  },

  {
    name: "Utility Bills",
    keywords: [
      "bill","electricity","water","wifi","internet",
      "broadband","recharge","mobile recharge",
      "phone bill","gas bill","utility"
    ],
  },

  {
    name: "Rent",
    keywords: [
      "rent","hostel","pg","flat","apartment",
      "room rent","house rent","accommodation"
    ],
  },

  {
    name: "Education",
    keywords: [
      "book","notebook","pen","pencil","course",
      "tuition","school","college","exam",
      "education","study","udemy","coursera",
      "certification","training"
    ],
  },

  {
    name: "Entertainment",
    keywords: [
      "movie","cinema","theatre","netflix",
      "prime","hotstar","spotify","concert",
      "show","event","gaming","game"
    ],
  },

  {
    name: "Electronics",
    keywords: [
      "mobile","phone","iphone","android",
      "laptop","computer","monitor","tablet",
      "charger","headphones","earphones",
      "keyboard","mouse","electronics"
    ],
  },

  {
    name: "Personal Care",
    keywords: [
      "shampoo","soap","facewash","makeup",
      "cosmetics","perfume","deodorant",
      "salon","haircut","spa","cream"
    ],
  },

  {
    name: "Fitness",
    keywords: [
      "gym","fitness","workout","protein",
      "supplement","yoga","sports","cricket",
      "football","badminton","tennis"
    ],
  },

  {
    name: "Pets",
    keywords: [
      "dog","cat","pet","pet food",
      "puppy","kitten","veterinary","vet"
    ],
  },

  {
    name: "Gifts",
    keywords: [
      "gift","present","birthday gift",
      "anniversary","flowers","bouquet"
    ],
  },

  {
    name: "Toys",
    keywords: [
      "toy","toys","teddy","doll",
      "lego","action figure","puzzle"
    ],
  },

  {
    name: "Insurance",
    keywords: [
      "insurance","life insurance",
      "health insurance","car insurance",
      "premium"
    ],
  },

  {
    name: "Investment",
    keywords: [
      "stock","mutual fund","sip",
      "investment","share market",
      "crypto","bitcoin","gold"
    ],
  },

  {
    name: "Home furniture",
    keywords: [
      "furniture","chair","table","bed",
      "sofa","curtain","home decor",
      "mattress","cupboard"
    ],
  },

    {
    name: "Welfare",
    keywords: [
     "staff welfare"
    ],
    },

    {
    name: "househelp",
    keywords: [
     "servent","maid"
    ],
    },


  {
    name: "Repairs",
    keywords: [
      "repair","service","maintenance",
      "plumber","electrician","mechanic",
      "fixing","repairing"
    ],
  },

  {
    name: "Subscriptions",
    keywords: [
      "subscription","netflix","spotify",
      "prime","youtube premium",
      "chatgpt","software"
    ],
  },

  {
    name: "Banking",
    keywords: [
      "bank charge","atm","processing fee",
      "interest","loan payment","emi"
    ],
  },

  {
    name: "Charity",
    keywords: [
      "donation","charity","fundraiser",
      "ngo","helping"
    ],
  },

  {
    name: "Kids",
    keywords: [
      "school fee","child","kid",
      "baby food","diaper","toy"
    ],
  },

  {
    name: "Wedding",
    keywords: [
      "wedding","marriage","engagement",
      "bridal","reception"
    ],
  },

  {
    name: "Festival",
    keywords: [
      "diwali","holi","eid","christmas",
      "puja","festival"
    ],
  },

  {
    name: "Office",
    keywords: [
      "office","stationery","printer",
      "paper","meeting","business"
    ],
  },

  {
    name: "Laundry",
    keywords: [
      "laundry","washing","dry cleaning"
    ],
  },

  {
    name: "Parking",
    keywords: [
      "parking","parking fee"
    ],
  },

  {
    name: "Fine",
    keywords: [
      "fine","penalty","challan"
    ],
  },

  {
    name: "Tax",
    keywords: [
      "tax","gst","income tax","property tax"
    ],
  },

  {
    name: "Vacation",
    keywords: [
      "vacation","holiday","trip",
      "resort","hotel","tour"
    ],
  },

  {
    name: "Dating",
    keywords: [
      "date","dating","valentine",
      "romantic dinner"
    ],
  },

  {
    name: "Other",
    keywords: []
  }
];

  let bestCategory = "Other";
let bestScore = 0;

for (let cat of categoryMap) {
  let score = 0;

  for (let word of cat.keywords) {
    const regex = new RegExp(`\\b${word}\\b`, "i");

    if (regex.test(text)) {
      score += 1;
    }
  }

  if (score > bestScore) {
    bestScore = score;
    bestCategory = cat.name;
  }
}

detectedCategory = bestScore > 0 ? bestCategory : "Other";

  // ✍️ Fill form fields
  setAmount(extractedAmount);
  setCategory(detectedCategory);
  setDescription(transcript);

  // 🔥 CLEAR TRANSCRIPT AFTER USING IT
  resetTranscript();

  // ⏳ Auto-submit after setting values
  setTimeout(() => {
    if (extractedAmount) {
      handleAddExpense();
    }
  }, 400);
};

  // 🔊 SPEAK SUMMARY
 /* const speakSummary = () => {
    speakText(
      `You have total expense of ${summary.total_expense || 0} rupees and ${summary.total_transactions || 0} transactions.`
    );
  };*/

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
    fetchCategories();
  }, []);

useEffect(() => {
  if (ocrConfidence !== null) {
    const timer = setTimeout(() => {
      setOcrConfidence(null);
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [ocrConfidence]);

  const speakSummary = () => {
  if (!summary) return;

  const text = `You have total expense of ${
    summary.total_expense ?? 0
  } rupees and ${
    summary.total_transactions ?? 0
  } transactions.`;

  speakText(text);
};

  if (!browserSupportsSpeechRecognition) {
    return <h1>Speech not supported in this browser</h1>;
  }

  return (

    
    
 <div
  className="min-h-screen p-8"
  style={{
    background: `
      radial-gradient(circle at top left, #6366f1 0%, transparent 20%),
      radial-gradient(circle at bottom right, #06b6d4 0%, transparent 25%),
      linear-gradient(135deg, #f8fafc, #e0f2fe)
    `,
    backgroundAttachment: "fixed",
  }}
>

 


  
  <div className="max-w-6xl mx-auto">

      <h1 className="text-4xl font-bold mb-6">
        Expense Dashboard
      </h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        <div className="backdrop-blur-lg bg-white/70 border border-white/30 p-6 rounded-2xl shadow-xl">
          <h2>Total Expense</h2>
          <p className="text-3xl">
            ₹{summary.total_expense || 0}
          </p>
          <button
            onClick={speakSummary}
            className="bg-purple-500 text-white px-3 py-1 mt-2 rounded"
          >
            🔊 Speak Summary
          </button>
        </div>

        <div className="backdrop-blur-lg bg-white/70 border border-white/30 p-6 rounded-2xl shadow-xl" >
          <h2>Transactions</h2>
          <p className="text-3xl">
            {summary.total_transactions || 0}
          </p>
        </div>

      </div>

      {/* PIE CHART */}
      <div className="backdrop-blur-lg bg-white/70 border border-white/30 p-6 rounded-2xl shadow-xl">
      <div
  onClick={() => navigate("/budget")}
  style={{
    padding: "20px",
    marginBottom: "15px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
    color: "white",
    cursor: "pointer",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    transition: "0.3s",
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.transform = "scale(1.03)")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.transform = "scale(1)")
  }
>
  <h2 style={{ marginBottom: "10px" }}>
    💰 Budget Manager
  </h2>

  <p style={{ marginBottom: "8px" }}>
    Monitor your monthly budget, spending,
    remaining balance and spending progress.
  </p>

  <p
    style={{
      fontSize: "12px",
      fontWeight: "bold",
      background: "rgba(255,255,255,0.15)",
      padding: "8px",
      borderRadius: "8px",
    }}
  >
    👉 Click here to open your Budget Manager page
    and view complete budget insights.
  </p>
</div>
        <div className="flex items-end gap-2 mb-4">
  <h2 className="text-xl font-bold">
    Category Breakdown
  </h2>

  <span className="text-xs text-gray-500 mb-1">
    (Click on a section to know more)
  </span>
</div>

        <PieChart width={500} height={300}>
         <Pie
  data={categories}
  dataKey="value"
  nameKey="name"
  outerRadius={100}
  label 
  onClick={(data) => {
    setSelectedCategory(data.payload.name);
  }}
>
  {categories.map((entry) => (
  <Cell
    key={entry.name}
    fill={getColorForCategory(entry.name)}
    stroke="#fff"
    strokeWidth={2}
  />
))}
</Pie>


          <Tooltip />
          <Legend />
        </PieChart>
        {selectedCategory && (
  <div className="mt-4 p-4 bg-white rounded-xl shadow-md">
    <h3 className="text-lg font-bold mb-2">
      {selectedCategory} Expenses
    </h3>

    {expenses
      .filter((exp) => exp.category === selectedCategory)
      .map((exp) => (
        <div key={exp.id} className="border-b py-2">
          <p>₹{exp.amount}</p>
          <p>{exp.description}</p>
        </div>
      ))}
  </div>
)}
      </div>

      {/* VOICE INPUT */}
      <div className="backdrop-blur-lg bg-white/70 border border-white/30 p-6 rounded-2xl shadow-xl">

        <h2 className="text-xl font-bold mb-4">
          Voice Expense Entry
        </h2>

       <button
  onClick={() => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();

      SpeechRecognition.startListening({
        continuous: true,
        language: "en-IN",
      });
    }
  }}
  className={`text-white px-4 py-2 rounded font-bold ${
    listening
      ? "bg-red-500 hover:bg-red-500"
      : "bg-green-500 hover:bg-green-600"
  }`}
>
  {listening
    ? "⏹️ Stop Recording"
    : "🎤 Start Recording"}
</button>

         <p
    className={`mt-4 font-bold ${
      listening ? "text-green-600" : "text-red-300"
    }`}
  >
    {listening
      ? "🎤 Listening..."
      : " Not Listening"}
  </p>


        <p className="mt-4">{transcript}</p>

        <button
          onClick={fillExpenseFromVoice}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Fill Form From Voice
        </button>

      </div>

      {/* ADD EXPENSE */}
      <div className="backdrop-blur-lg bg-white/70 border border-white/30 p-6 rounded-2xl shadow-xl">

        <h2 className="text-xl font-bold mb-4">
          Add Expense
        </h2>

          {ocrConfidence !== null && (
  <div
    style={{
      marginTop: "5px",
      padding: "5px",
      borderRadius: "10px",
      background:
        ocrConfidence > 85
          ? "#22c55e"
          : ocrConfidence > 60
          ? "#f59e0b"
          : "#ef4444",
      color: "white",
      fontWeight: "bold",
    }}
  >
    🧾 OCR Confidence: {Math.round(ocrConfidence)}%
  </div>
)}

         <BillScanner
    onExtract={(data) => {
      setAmount(data.amount || "");
      setCategory(data.category || "");
      setDescription(data.description || "");
       setOcrConfidence(data.confidence || 0);
    }}
  />

      


        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <button
          onClick={handleAddExpense}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Expense
        </button>

      </div>

      {/* EXPENSE LIST */}
      <h2 className="text-2xl font-bold mb-4">
        Your Expenses
      </h2>

      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="backdrop-blur-lg bg-white/70 border border-white/30 p-6 rounded-2xl shadow-xl"
        >
          <h3>{expense.category}</h3>
          <p>₹{expense.amount}</p>
          <p>{expense.description}</p>

          <div className="flex gap-2 mt-3">

            <button
              onClick={() => deleteExpense(expense.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>

            <button
              onClick={() =>
                speakText(
                  `Category ${expense.category}, amount ${expense.amount}, description ${expense.description}`
                )
              }
              className="bg-purple-500 text-white px-3 py-1 rounded"
            >
              🔊 Speak
            </button>

          </div>
        </div>
      ))}

    </div>
    </div>
  );
}

export default Dashboard;