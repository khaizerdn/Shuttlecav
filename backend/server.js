const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');  // Import the CORS package
dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());  // Enable CORS for all origins (adjust this for production)
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the MySQL database');
  }
});

// Signup Route
app.post('/signup', (req, res) => {
    const { surname, firstname, middleinitial, age, gender, phonenumber, username, password, confirmPassword } = req.body;
  
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }
  
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing password' });
      }
  
      const query = `
        INSERT INTO users (surname, firstname, middleinitial, age, gender, phonenumber, username, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.query(query, [surname, firstname, middleinitial, age, gender, phonenumber, username, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error signing up' });
        }
        return res.status(200).json({ message: 'User registered successfully' });
      });
    });
  });
  

// Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging in' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Error comparing password' });
      }
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
      }

      // Generate JWT token with userId in the payload
      const token = jwt.sign(
        { userId: result[0].id, username: result[0].username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({ message: 'Login successful', token });
    });
  });
});

// server.js
app.get('/user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the header
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user information from the database
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [decoded.userId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error fetching user info' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return the user's information
      const user = result[0];
      return res.status(200).json({
        firstname: user.firstname,
        surname: user.surname,
        middleinitial: user.middleinitial,
        age: user.age,
        gender: user.gender,
        phonenumber: user.phonenumber,
        username: user.username,
      });
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/update-nfc', async (req, res) => {
  const { nfcCardId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Verify the token and get the user ID
    const decoded = jwt.verify(token, 'your-secret-key');
    const userId = decoded.userId;

    // Update the user's NFC card ID in the database
    await User.updateOne({ _id: userId }, { nfcCardId });

    res.status(200).json({ message: 'NFC card ID updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update NFC card ID' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
