import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Gpio } from 'pigpio';
import spi from 'spi-device';
import MFRC522 from 'mfrc522-rfid';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- RFID Module Init ---
let mfrc522;

console.log('========== RFID INIT ==========');
try {
  if (!fs.existsSync('/dev/spidev0.0')) {
    console.error('SPI device not found: /dev/spidev0.0 does not exist!');
    process.exit(1);
  }

  const spiDevice = spi.openSync(0, 0); // Bus 0, device 0
  mfrc522 = new MFRC522(spiDevice);
  console.log('MFRC522 initialized using mfrc522-rfid');

} catch (error) {
  console.error('===== RFID Initialization Error =====');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Full error:', error);
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

// RFID Scan Endpoint
app.get('/api/read-rfid', async (req, res) => {
  try {
    mfrc522.reset();

    const card = mfrc522.findCard();
    if (!card.status) {
      return res.json({ success: false, message: 'No card detected' });
    }

    const uid = mfrc522.getUid();
    if (!uid.status) {
      return res.json({ success: false, message: 'Unable to read UID' });
    }

    const tagId = uid.data.map(byte => byte.toString(16).padStart(2, '0')).join(':');
    res.json({ success: true, tag_id: tagId });
  } catch (error) {
    console.error('RFID read error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to read RFID tag' });
  }
});

// Process Payment
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
