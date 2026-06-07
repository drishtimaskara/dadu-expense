import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// CREATE OR UPDATE BUDGET
router.post("/", async (req, res) => {
  try {
    console.log("BUDGET REQUEST:", req.body);

    const { user_id, monthly_limit } = req.body;

    // validation (VERY IMPORTANT)
    if (!user_id || !monthly_limit) {
      return res.status(400).json({
        message: "user_id and monthly_limit are required",
      });
    }

    // check if budget exists
    const existing = await pool.query(
      "SELECT * FROM budgets WHERE user_id = $1",
      [user_id]
    );

    let result;

    if (existing.rows.length > 0) {
      // UPDATE
      result = await pool.query(
        `UPDATE budgets
         SET monthly_limit = $1
         WHERE user_id = $2
         RETURNING *`,
        [monthly_limit, user_id]
      );
    } else {
      // INSERT
      result = await pool.query(
        `INSERT INTO budgets (user_id, monthly_limit)
         VALUES ($1, $2)
         RETURNING *`,
        [user_id, monthly_limit]
      );
    }

    return res.json({
      message: "Budget saved successfully",
      budget: result.rows[0],
    });

  } catch (err) {
    console.log("BUDGET ERROR:", err);

    return res.status(500).json({
      message: "Database error while saving budget",
      error: err.message,
    });
  }
});

// GET BUDGET
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM budgets WHERE user_id = $1",
      [user_id]
    );

    return res.json(result.rows[0] || null);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching budget" });
  }
});

export default router;