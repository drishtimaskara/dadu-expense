import { useState, useEffect } from "react";
import API from "../services/api";

function Budget() {
  const [budget, setBudget] = useState("");
  const [savedBudget, setSavedBudget] = useState(null);

  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch Budget
  const fetchBudget = async () => {
    try {
      const res = await API.get(`/budgets/${user.id}`);
      if (res.data) {
        setSavedBudget(res.data);
        setBudget(res.data.monthly_limit);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch Total Expense directly from Dashboard summary API
  const fetchExpenseSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/expenses/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSpent(Number(res.data.total_expense || 0));
    } catch (err) {
      console.log(err);
    }
  };

  // Save Budget
  const saveBudget = async () => {
    try {
      await API.post("/budgets", {
        user_id: user.id,
        monthly_limit: Number(budget),
      });

      alert("Budget Saved Successfully");

      fetchBudget();
    } catch (err) {
      console.log(err);
    }
  };

  // Calculate Usage
  useEffect(() => {
    if (!budget) return;

    const remain = Number(budget) - spent;
    const percent = (spent / Number(budget)) * 100;

    setRemaining(remain);
    setPercentage(percent);
  }, [spent, budget]);

  useEffect(() => {
    fetchBudget();
    fetchExpenseSummary();

    const interval = setInterval(() => {
      fetchExpenseSummary();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h1>💰 Budget Manager</h1>

      {/* Budget Input */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <h3>Set Monthly Budget</h3>

        <input
          type="number"
          value={budget}
          placeholder="Enter Monthly Budget"
          onChange={(e) => setBudget(e.target.value)}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
          }}
        />

        <button
          onClick={saveBudget}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
          }}
        >
          Save Budget
        </button>
      </div>

      {/* Budget Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "15px",
        }}
      >
        <div
          style={{
            padding: "20px",
            background: "#dbeafe",
            borderRadius: "10px",
          }}
        >
          <h3>Total Budget</h3>
          <h2>₹{budget || 0}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            background: "#fee2e2",
            borderRadius: "10px",
          }}
        >
          <h3>Spent</h3>
          <h2>₹{spent}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            background: "#dcfce7",
            borderRadius: "10px",
          }}
        >
          <h3>Remaining</h3>
          <h2>₹{remaining}</h2>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          marginTop: "30px",
          background: "#e5e7eb",
          borderRadius: "20px",
          height: "25px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(percentage, 100)}%`,
            height: "100%",
            background:
              percentage >= 100
                ? "red"
                : percentage >= 80
                ? "orange"
                : "green",
            transition: "0.3s",
          }}
        />
      </div>

      <h3 style={{ marginTop: "10px" }}>
        {percentage.toFixed(1)}% Used
      </h3>

      {/* Alerts */}
      {/* Funny Budget Alerts */}

{percentage <= 50 && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#bbf7d0",
      borderRadius: "10px",
      color: "#166534",
      fontWeight: "bold",
    }}
  >
    😎 Relax! Your wallet is chilling harder than you are. Spend responsibly... or don't, I'm just a budget tracker.
  </div>
)}

{percentage > 50 && percentage <= 80 && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#d9f99d",
      borderRadius: "10px",
      color: "#365314",
      fontWeight: "bold",
    }}
  >
    🧐 You're spending at a healthy pace. Your future self still likes you.
  </div>
)}

{percentage > 80 && percentage <= 100 && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#fde68a",
      borderRadius: "10px",
      color: "#92400e",
      fontWeight: "bold",
    }}
  >
    ⚠️ Easy there, billionaire. Your budget is sweating nervously.
  </div>
)}

{percentage > 100 && percentage <= 150 && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#fecaca",
      borderRadius: "10px",
      color: "#991b1b",
      fontWeight: "bold",
    }}
  >
    🚨 Budget exceeded. Your wallet just filed a missing person report.
  </div>
)}

{percentage > 150 && percentage <= 200 && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#fca5a5",
      borderRadius: "10px",
      color: "#7f1d1d",
      fontWeight: "bold",
    }}
  >
    💀 You're spending like the main character in a movie who discovers money isn't real.
  </div>
)}

{percentage > 200 && percentage <= 400 && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#fb7185",
      borderRadius: "10px",
      color: "white",
      fontWeight: "bold",
    }}
  >
    🔥 At this point your budget isn't a limit, it's a suggestion you're actively ignoring.
  </div>
)}

{percentage > 400 && percentage <= 1000 && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#e11d48",
      borderRadius: "10px",
      color: "white",
      fontWeight: "bold",
    }}
  >
    🚑 Emergency! Your spending habits are now visible from space.
  </div>
)}

{percentage > 1000 && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#881337",
      borderRadius: "10px",
      color: "white",
      fontWeight: "bold",
      fontSize: "18px",
    }}
  >
    ☠️ Congratulations! You have successfully defeated budgeting. Economists are studying your behavior.
  </div>
)}
      {/* Extra Stats */}
      <div
        style={{
          marginTop: "25px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
        }}
      >
        <h3>Budget Insights</h3>

        <p>Monthly Budget: ₹{budget || 0}</p>
        <p>Total Spent: ₹{spent}</p>
        <p>Amount Left: ₹{remaining}</p>

        {remaining < 0 && (
          <p style={{ color: "red" }}>
            You exceeded your budget by ₹{Math.abs(remaining)}
          </p>
        )}
      </div>
    </div>
  );
}

export default Budget;