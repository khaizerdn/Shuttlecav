import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Gpio } from 'pigpio';
import MFRC522 from 'mfrc522-rpi';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize MFRC522
let mfrc522;
try {
  mfrc522 = new MFRC522();
} catch (error) {
  console.error('Failed to initialize MFRC522:', error.message);
  process.exit(1);
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool(dbConfig);

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

try {
  console.log('Attempting to initialize MFRC522...');
  mfrc522 = new MFRC522();
  console.log('MFRC522 initialized successfully');
} catch (error) {
  console.error('Failed to initialize MFRC522:', error.stack);
  process.exit(1);
}

// Endpoint to read RFID tag
app.get('/api/read-rfid', async (req, res) => {
  try {
    mfrc522.reset();
    const response = mfrc522.findCard();
    if (!response.status) {
      return res.json({ success: false, message: 'No card detected' });
    }

    const uidResponse = mfrc522.getUid();
    if (!uidResponse.status) {
      return res.json({ success: false, message: 'Unable to read UID' });
    }

    const uid = uidResponse.data.map(byte => byte.toString(16).padStart(2, '0')).join(':');
    res.json({ success: true, tag_id: uid });
  } catch (error) {
    console.error('RFID read error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to read RFID tag' });
  }
});

// Endpoint to process payment
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});