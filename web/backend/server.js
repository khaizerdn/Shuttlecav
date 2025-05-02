// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool(dbConfig);

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Endpoint to add amount to user's balance
app.post("/api/process-payment", async (req, res) => {
  const { tag_id, amount } = req.body;

  // Input validation
  if (!tag_id || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid tag_id or amount"
    });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      // Start transaction
      await connection.beginTransaction();

      // Find user by tag_id and get their current balance
      const [users] = await connection.query(
        "SELECT balance FROM users WHERE tag_id = ?",
        [tag_id]
      );

      if (users.length === 0) {
        throw new Error("User not found");
      }

      const currentBalance = users[0].balance;

      // Add amount to balance (changed from subtraction to addition)
      await connection.query(
        "UPDATE users SET balance = balance + ? WHERE tag_id = ?",
        [amount, tag_id]
      );

      // Commit transaction
      await connection.commit();

      res.json({
        success: true,
        newBalance: currentBalance + amount,
        message: "Balance updated successfully"
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Balance update failed"
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});