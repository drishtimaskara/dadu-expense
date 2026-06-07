import express from "express";

import {
  addExpense,
  getExpenses,
  deleteExpense,
  getSummary,
   getCategoryBreakdown
} from "../controllers/expenseController.js";

import { verifyToken }
from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  addExpense
);

router.get(
  "/",
  verifyToken,
  getExpenses
);

router.delete(
  "/:id",
  verifyToken,
  deleteExpense
);

router.get(
  "/summary",
  verifyToken,
  getSummary
);

router.get(
  "/categories",
  verifyToken,
  getCategoryBreakdown
);

export default router;