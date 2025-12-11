import express from "express"
import "dotenv/config"
import { sql } from "./config/db.js";

const app = express();

// Middleware
app.use(express.json());

const PORT = process.env.PORT || 5001;

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR NOT NULL,
      created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;

    console.log("Database initialized successfully!");
  } catch (error) {
    console.log("Error initializing database ", error);
    process.exit(1) // status code 1 means failure, 0 is success
  }
}

app.get("/api/transactions/:userId", async (request, response) => {
  try {
    const { userId } = request.params;

    const transactions = await sql`
      SELECT * FROM transactions WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    response.status(200).json(transactions);

  } catch (error) {
    console.log("Error in getting the transactions: ", error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});

app.post("/api/transactions", async (request, response) => {
  try {
    const { title, amount, category, user_id } = request.body;
    if (!title || !user_id || !category || amount === undefined) {
      return response.status(400).json({ message: "All fields are required." });
    }

    const transaction = await sql`
      INSERT INTO transactions(user_id, title, amount, category)
      VALUES (${user_id}, ${title}, ${amount}, ${category})
      RETURNING *
    `;

    response.status(201).json(transaction[0])
  } catch (error) {
    console.log("Error in creating transaction: ", error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});

app.delete("/api/transactions/:id", async (request, response) => {
  try {
    const { id } = request.params
    if (isNaN(parseInt(id))) {
      return response.status(400).json({ message: "Invalid transaction ID!" });
    }

    const result = await sql`
      DELETE FROM transactions WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return response.status(404).json({ message: "Transaction not found!" })
    }

    response.status(200).json({ message: "Transaction deleted successfully!" })
  } catch (error) {
    console.log("Error in deleting the transactions: ", error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  })
})