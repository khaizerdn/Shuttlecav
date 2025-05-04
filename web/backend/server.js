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

// // --- RFID Module Initialization ---
// let mfrc522;
// let lastUID = null;

// console.log('========== RFID INIT ==========');
// try {
//   console.log('Checking for SPI device...');
//   if (!fs.existsSync('/dev/spidev0.0')) {
//     console.error('SPI device not found: /dev/spidev0.0 does not exist!');
//     process.exit(1);
//   }

//   mfrc522 = new RPiMfrc522();
//   await mfrc522.init();

//   console.log('MFRC522 initialized successfully.');
// } catch (error) {
//   console.error('===== RFID Initialization Error =====');
//   console.error('Error name:', error.name);
//   console.error('Error message:', error.message);
//   console.error('Full error:', error);
//   process.exit(1);
// }

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

// --- RFID Reader Endpoint ---
app.get('/api/read-rfid', async (req, res) => {
  try {
    const present = await mfrc522.cardPresent();
    if (!present) {
      return res.json({ success: false, message: 'No card detected' });
    }

    const uid = await mfrc522.antiCollision();

    if (!uid || !Array.isArray(uid)) {
      return res.json({ success: false, message: 'Unable to read UID' });
    }

    const uidString = uid.map(byte => byte.toString(16).padStart(2, '0')).join(':');

    // Prevent duplicate scan within 1 second
    if (uidString === lastUID) {
      return res.json({ success: false, message: 'Duplicate scan' });
    }

    lastUID = uidString;
    setTimeout(() => {
      lastUID = null;
    }, 1000);

    res.json({ success: true, tag_id: uidString });
  } catch (error) {
    console.error('RFID read error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to read RFID tag' });
  }
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

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
