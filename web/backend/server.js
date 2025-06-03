import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
// import { Gpio } from 'pigpio';
import fs from 'fs';
// import RPiMfrc522 from 'rpi-mfrc522';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Database Configuration ---
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pool = mysql.createPool(dbConfig);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// --- Payment Processing Endpoint ---
app.post('/api/process-payment', async (req, res) => {
  const { tag_id, amount } = req.body;

  if (!tag_id || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tag_id or amount',
    });
  }

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [users] = await connection.query('SELECT balance FROM users WHERE tag_id = ?', [tag_id]);

      if (users.length === 0) {
        throw new Error('User not found');
      }

      const currentBalance = users[0].balance;
      await connection.query('UPDATE users SET balance = balance + ? WHERE tag_id = ?', [amount, tag_id]);
      await connection.commit();

      res.json({
        success: true,
        newBalance: currentBalance + amount,
        message: 'Balance updated successfully',
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
      message: error.message || 'Balance update failed',
    });
  }
});

app.get('/api/get-user', async (req, res) => {
  const { tag_id } = req.query;
  try {
    const [users] = await pool.query('SELECT firstname, middleinitial, surname FROM users WHERE tag_id = ?', [tag_id]);
    if (users.length === 0) {
      return res.json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
