// შევქმნათ expense-manager აპლიკაციის ენდფოინთები express-ის დახმარებით.
// დამატება, განახლება, წაკითხვა, წაშლა (ვგულისხმობთ REST API endpoint_ებს).
// ხარჯის ობიექტს უნდა ქონდეს შემდეგი ველები:
// id, name, cost, createdAt

import express from "express";
import fs from "fs/promises";
import path from "path";
import moment from "moment";

interface Expense {
  id: number;
  name: string;
  cost: number;
  createdAt: string;
}

const PORT = 3000;
const app = express();

const filePath = path.join(__dirname, "../data.json");

async function readExpenseManager() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const expenseManager = JSON.parse(data);
    return expenseManager;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}

app.use(express.json());

app.get("/api/expenses", async (req, res) => {
  try {
    const expenseManager: Expense[] = await readExpenseManager();
    res.json({ success: true, data: expenseManager });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
});

app.get("/api/expenses/:id", async (req, res) => {
  try {
    const expenseManager: Expense[] = await readExpenseManager();
    const id = parseInt(req.params.id);
    const index = expenseManager.findIndex((expense) => expense.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: "Expense not found" });
    }

    const expense = expenseManager[index];

    res.json({ success: true, data: expense });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    const expenseManager: Expense[] = await readExpenseManager();
    const expense: Expense = req.body;
    const lastId = expenseManager[expenseManager.length - 1]?.id;
    expense.id = lastId ? lastId + 1 : 1;
    expense.createdAt = moment().format("DD/MM/YYYY");
    expenseManager.push(expense);
    console.log(expenseManager);

    res.send({ success: true, data: expenseManager, message: "expense added" });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    let expenseManager: Expense[] = await readExpenseManager();
    const { id } = req.params;
    const index = expenseManager.findIndex(
      (expense) => expense.id === parseInt(id)
    );

    if (index === -1) {
      res.status(404);
      res.json({ success: false, message: "Expense doesn't exists" });
    }
    const expense = expenseManager[index];
    expenseManager = expenseManager.filter(
      (expense) => expense.id !== parseInt(id)
    );

    res.json({ success: true, data: expense, message: "expense deleted" });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  try {
    const expenseManager: Expense[] = await readExpenseManager();
    const changeExpense: Expense = req.body;
    const { id } = req.params;
    const index = expenseManager.findIndex((exp) => exp.id === parseInt(id));
    if (index === -1) {
      res.status(404);
      res.json({ success: false, message: "Expense not found" });
    }
    let expense = expenseManager[index];
    expense = {
      ...expense,
      ...changeExpense,
    };
    expenseManager[index] = expense;
    res.json({ success: true, data: expense, message: "expense deleted" });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
