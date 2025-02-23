const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
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

    db.query(query, [surname, firstname, middleinitial, age, gender, phonenumber, username, hashedPassword], (err) => {
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

      const token = jwt.sign(
        { userId: result[0].id, username: result[0].username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({ message: 'Login successful', token });
    });
  });
});

// Get User Info Route
app.get('/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [decoded.userId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error fetching user info' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = result[0];
      return res.status(200).json({
        firstname: user.firstname,
        surname: user.surname,
        middleinitial: user.middleinitial,
        age: user.age,
        gender: user.gender,
        phonenumber: user.phonenumber,
        username: user.username,
        tag_id: user.tag_id,
      });
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Update NFC Card ID Route
app.post('/link-nfc', (req, res) => {
  const { nfcCardId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    // First, check if the NFC card ID is already linked to a different user
    const checkQuery = 'SELECT * FROM users WHERE tag_id = ? AND id <> ?';
    db.query(checkQuery, [nfcCardId, userId], (err, results) => {
      if (err) {
        console.error('Database error on check query:', err);
        return res.status(500).json({ message: 'Error checking NFC card ID' });
      }
      
      if (results.length > 0) {
        // Duplicate found for a different user – send duplication notice.
        return res.status(400).json({ message: 'This NFC card is already linked to another user.' });
      }
      
      // Proceed to update NFC card id for current user.
      const updateQuery = 'UPDATE users SET tag_id = ? WHERE id = ?';
      db.query(updateQuery, [nfcCardId, userId], (err, updateResult) => {
        if (err) {
          console.error('Database error on update query:', err);
          // Check error for duplicate key violation.
          if (
            err.code === 'ER_DUP_ENTRY' ||
            (err.sqlMessage && err.sqlMessage.includes('Duplicate entry'))
          ) {
            return res.status(400).json({ message: 'This NFC card is already linked to another user.' });
          }
          return res.status(500).json({ message: 'Error uasdadapdating NFC card ID' });
        }
        
        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({ message: 'NFC card ID updated successfully' });
      });
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});



// New Route: Unlink NFC Card ID
app.post('/unlink-nfc', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const query = 'UPDATE users SET tag_id = NULL WHERE id = ?';
    db.query(query, [userId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error unlinking NFC card ID' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ message: 'NFC card ID unlinked successfully' });
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// ----------------------
// AUTHENTICATION MIDDLEWARE
// ----------------------
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded should include username (and userId if needed)
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ----------------------
// SHUTTLE ENDPOINTS
// ----------------------

// Add a new shuttle (POST /shuttles)
app.post('/shuttles', authenticateToken, (req, res) => {
  const { shuttleDriver, shuttlePlatNumber, route } = req.body;
  const username = req.user.username;
  if (!shuttleDriver || !shuttlePlatNumber || !route) {
    return res.status(400).json({ message: 'Missing shuttle information' });
  }
  // Generate a unique ID (you can adjust the logic as needed)
  const id = Date.now().toString();
  const query = `
    INSERT INTO created_shuttle (id, username, shuttleDriver, shuttlePlatNumber, route)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [id, username, shuttleDriver, shuttlePlatNumber, route], (err, result) => {
    if (err) {
      console.error('Error inserting shuttle:', err);
      return res.status(500).json({ message: 'Error adding shuttle' });
    }
    return res.status(200).json({ message: 'Shuttle added successfully', id });
  });
});

// Get shuttles for the logged‑in user (GET /shuttles)
app.get('/shuttles', authenticateToken, (req, res) => {
  const username = req.user.username;
  const query = 'SELECT * FROM created_shuttle WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error fetching shuttles:', err);
      return res.status(500).json({ message: 'Error fetching shuttles' });
    }
    return res.status(200).json(results);
  });
});

// Delete a shuttle by id (DELETE /shuttles/:id)
app.delete('/shuttles/:id', authenticateToken, (req, res) => {
  const username = req.user.username;
  const shuttleId = req.params.id;
  // Ensure the shuttle belongs to the current user before deleting
  const checkQuery = 'SELECT * FROM created_shuttle WHERE id = ? AND username = ?';
  db.query(checkQuery, [shuttleId, username], (err, results) => {
    if (err) {
      console.error('Error checking shuttle:', err);
      return res.status(500).json({ message: 'Error checking shuttle' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Shuttle not found or unauthorized' });
    }
    const deleteQuery = 'DELETE FROM created_shuttle WHERE id = ? AND username = ?';
    db.query(deleteQuery, [shuttleId, username], (err, result) => {
      if (err) {
        console.error('Error deleting shuttle:', err);
        return res.status(500).json({ message: 'Error deleting shuttle' });
      }
      return res.status(200).json({ message: 'Shuttle deleted successfully' });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});