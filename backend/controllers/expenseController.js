import pool from "../db/db.js";

// Add Expense
export const addExpense = async (req, res) => {
  try {
    const { amount, category, description } = req.body;

    const userId = req.user.id;

    const result = await pool.query(
      `
      INSERT INTO expenses
      (user_id, amount, category, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [userId, amount, category, description]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Get All Expenses
export const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT *
      FROM expenses
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Delete Expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM expenses WHERE id = $1",
      [id]
    );

    res.json({
      message: "Expense Deleted",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
      COALESCE(SUM(amount),0) AS total_expense,
      COUNT(*) AS total_transactions
      FROM expenses
      WHERE user_id = $1
      `,
      [userId]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const getCategoryBreakdown = async (req, res) => {
  try {

    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
      category,
      SUM(amount) as total
      FROM expenses
      WHERE user_id = $1
      GROUP BY category
      ORDER BY total DESC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};