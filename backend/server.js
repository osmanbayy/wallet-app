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

    console.log(transaction);
    response.status(201).json(transaction[0])
  } catch (error) {
    console.log("Error in creating transaction: ", error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  })
})