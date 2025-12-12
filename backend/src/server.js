import express from "express"
import "dotenv/config"
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js"
import job from "./config/cron.js"

const app = express();

if (process.env.NODE_ENV === "production") job.start()

// Middleware
app.use(express.json());
app.use(rateLimiter)

const PORT = process.env.PORT || 5001;

app.use("/api/transactions", transactionsRoute);

app.get("/api/health", (request, response) => {
  response.status(200).json({ status: "ok" })
})

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  })
})