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

// MySQL connection with settings to support BIGINT as string
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  supportBigNumbers: true,
  bigNumberStrings: true
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the MySQL database');
  }
});

// FlakeID generator for unique numeric IDs
const FlakeId = require('flake-idgen');
const intformat = require('biguint-format');
const flakeIdGen = new FlakeId(); // You can pass configuration options if needed

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

    // Generate a unique numeric id using the Snowflake algorithm
    const id = intformat(flakeIdGen.next(), 'dec'); 

    const query = `
      INSERT INTO users (id, surname, firstname, middleinitial, age, gender, phonenumber, username, password) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [id, surname, firstname, middleinitial, age, gender, phonenumber, username, hashedPassword], (err) => {
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
        { 
          userId: result[0].id, 
          username: result[0].username, 
          firstname: result[0].firstname, 
          surname: result[0].surname 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
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
    // Use CAST to ensure the parameter is treated as an unsigned integer
    const query = 'SELECT * FROM users WHERE id = CAST(? AS UNSIGNED)';
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
        balance: user.balance  // Include the balance field here
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
        return res.status(400).json({ message: 'This NFC card is already linked to another user.' });
      }
      
      // Update NFC card id for current user.
      const updateQuery = 'UPDATE users SET tag_id = ? WHERE id = ?';
      db.query(updateQuery, [nfcCardId, userId], (err, updateResult) => {
        if (err) {
          console.error('Database error on update query:', err);
          if (err.code === 'ER_DUP_ENTRY' || (err.sqlMessage && err.sqlMessage.includes('Duplicate entry'))) {
            return res.status(400).json({ message: 'This NFC card is already linked to another user.' });
          }
          return res.status(500).json({ message: 'Error updating NFC card ID' });
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
    req.user = decoded; // decoded includes username, firstname, surname, and userId
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
  const { shuttleDriver, shuttlePlatNumber, route_id } = req.body;
  const username = req.user.username;
  if (!shuttleDriver || !shuttlePlatNumber || !route_id) {
    return res.status(400).json({ message: 'Missing shuttle information' });
  }
  // Generate a unique ID using flake-id
  const id = intformat(flakeIdGen.next(), 'dec');
  const query = `
    INSERT INTO created_shuttle (id, username, shuttleDriver, shuttlePlatNumber, route_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [id, username, shuttleDriver, shuttlePlatNumber, route_id], (err, result) => {
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
  const query = `
    SELECT cs.*, r.origin, r.destination, r.added_rate
    FROM created_shuttle cs
    JOIN routes r ON cs.route_id = r.id
    WHERE cs.username = ?
  `;
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

// ----------------------
// PASSENGER TYPES ENDPOINTS
// ----------------------

// Get all passenger types
app.get('/passenger-types', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM passenger_types';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching passenger types:', err);
      return res.status(500).json({ message: 'Error fetching passenger types' });
    }
    return res.status(200).json(results);
  });
});

// Add a new passenger type
app.post('/passenger-types', authenticateToken, (req, res) => {
  const { passenger_type, passenger_rate } = req.body;
  if (!passenger_type || passenger_rate == null) {
    return res.status(400).json({ message: 'Missing passenger type or rate' });
  }
  const query = 'INSERT INTO passenger_types (passenger_type, passenger_rate) VALUES (?, ?)';
  db.query(query, [passenger_type, passenger_rate], (err, result) => {
    if (err) {
      console.error('Error adding passenger type:', err);
      return res.status(500).json({ message: 'Error adding passenger type' });
    }
    return res.status(200).json({ message: 'Passenger type added successfully', id: result.insertId });
  });
});

// Update a passenger type
app.put('/passenger-types/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { passenger_type, passenger_rate } = req.body;
  if (!passenger_type || passenger_rate == null) {
    return res.status(400).json({ message: 'Missing passenger type or rate' });
  }
  const query = 'UPDATE passenger_types SET passenger_type = ?, passenger_rate = ? WHERE id = ?';
  db.query(query, [passenger_type, passenger_rate, id], (err, result) => {
    if (err) {
      console.error('Error updating passenger type:', err);
      return res.status(500).json({ message: 'Error updating passenger type' });
    }
    return res.status(200).json({ message: 'Passenger type updated successfully' });
  });
});

// Delete a passenger type
app.delete('/passenger-types/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM passenger_types WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting passenger type:', err);
      return res.status(500).json({ message: 'Error deleting passenger type' });
    }
    return res.status(200).json({ message: 'Passenger type deleted successfully' });
  });
});

// ----------------------
// ROUTES ENDPOINTS
// ----------------------

// Get all routes
app.get('/routes', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM routes';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching routes:', err);
      return res.status(500).json({ message: 'Error fetching routes' });
    }
    return res.status(200).json(results);
  });
});

// Add a new route
app.post('/routes', authenticateToken, (req, res) => {
  const { origin, destination, added_rate } = req.body;
  if (!origin || !destination || added_rate == null) {
    return res.status(400).json({ message: 'Missing route information' });
  }
  const query = 'INSERT INTO routes (origin, destination, added_rate) VALUES (?, ?, ?)';
  db.query(query, [origin, destination, added_rate], (err, result) => {
    if (err) {
      console.error('Error adding route:', err);
      return res.status(500).json({ message: 'Error adding route' });
    }
    return res.status(200).json({ message: 'Route added successfully', id: result.insertId });
  });
});

// Update a route
app.put('/routes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { origin, destination, added_rate } = req.body;
  if (!origin || !destination || added_rate == null) {
    return res.status(400).json({ message: 'Missing route information' });
  }
  const query = 'UPDATE routes SET origin = ?, destination = ?, added_rate = ? WHERE id = ?';
  db.query(query, [origin, destination, added_rate, id], (err, result) => {
    if (err) {
      console.error('Error updating route:', err);
      return res.status(500).json({ message: 'Error updating route' });
    }
    return res.status(200).json({ message: 'Route updated successfully' });
  });
});

// Delete a route
app.delete('/routes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM routes WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting route:', err);
      return res.status(500).json({ message: 'Error deleting route' });
    }
    return res.status(200).json({ message: 'Route deleted successfully' });
  });
});

// ----------------------
// INSPECTIONS ENDPOINT
// ----------------------

// Add a new inspection
app.post('/inspections', authenticateToken, (req, res) => {
  // Extract inspector info from the token.
  const inspector_id = req.user.userId;
  const inspector_fullname = req.user.firstname + ' ' + req.user.surname;

  // Extract inspection data from the request body (including plate).
  const { driver, plate, route, start_datetime, end_datetime, total_passengers, total_claimed_money, logs } = req.body;
  // Generate a unique inspection id using flake-id
  const inspectionId = intformat(flakeIdGen.next(), 'dec');
  
  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ message: 'Transaction initiation failed' });
    }
    
    // Include plate in the inspection record.
    const inspectionQuery = `
      INSERT INTO inspections 
      (id, inspector_id, inspector_fullname, driver, plate, origin, destination, added_rate, start_datetime, end_datetime, total_passengers, total_claimed_money)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { origin, destination, added_rate } = route;
    db.query(
      inspectionQuery,
      [
        inspectionId,
        inspector_id,
        inspector_fullname,
        driver || '',
        plate || '',
        origin || '',
        destination || '',
        added_rate ? parseFloat(added_rate) : 0,
        start_datetime,
        end_datetime,
        total_passengers,
        total_claimed_money
      ],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ message: 'Error inserting inspection data' });
          });
        }
        if (logs && logs.length > 0) {
          // Map logs to include fare, origin, destination, and plate in each log.
          const logValues = logs.map(log => [
            log.id,
            inspectionId,
            log.passenger_type,
            log.tag_id,
            log.scanned_datetime,
            log.fare,          // fare from log object
            origin || '',      // origin from route
            destination || '', // destination from route
            plate || ''        // plate number from request body
          ]);
          const logQuery = `
            INSERT INTO inspection_logs 
            (id, inspection_id, passenger_type, tag_id, scanned_datetime, fare, origin, destination, plate) 
            VALUES ?
          `;
          db.query(logQuery, [logValues], (err, result) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Error inserting inspection logs' });
              });
            }
            // Update the "passenger" column using a JOIN with the users table.
            const updatePassengerQuery = `
              UPDATE inspection_logs il
              JOIN users u ON u.tag_id = il.tag_id
              SET il.passenger = u.id
              WHERE il.inspection_id = ?
            `;
            db.query(updatePassengerQuery, [inspectionId], (err, result) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: 'Error updating passenger column', error: err });
                });
              }
              // For each log with a valid tag_id, update the corresponding user's balance.
              const updateBalancePromises = logs
                .filter(log => log.tag_id)
                .map(log => {
                  return new Promise((resolve, reject) => {
                    const updateQuery = `
                      UPDATE users 
                      SET balance = balance - (
                        (SELECT passenger_rate FROM passenger_types WHERE passenger_type = ?) + ?
                      )
                      WHERE tag_id = ?
                    `;
                    const routeAddedRate = added_rate ? parseFloat(added_rate) : 0;
                    db.query(updateQuery, [log.passenger_type, routeAddedRate, log.tag_id], (err, result) => {
                      if (err) {
                        return reject(err);
                      }
                      resolve(result);
                    });
                  });
                });
              
              Promise.all(updateBalancePromises)
                .then(() => {
                  db.commit(err => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).json({ message: 'Error committing transaction' });
                      });
                    }
                    return res.status(200).json({ 
                      message: 'Inspection recorded and balances updated successfully', 
                      inspectionId: inspectionId 
                    });
                  });
                })
                .catch(err => {
                  return db.rollback(() => {
                    res.status(500).json({ message: 'Error updating user balances', error: err });
                  });
                });
            });
          });
        } else {
          // No logs to process, commit the transaction.
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Error committing transaction' });
              });
            }
            return res.status(200).json({ 
              message: 'Inspection recorded successfully', 
              inspectionId: inspectionId 
            });
          });
        }
      }
    );
  });
});


// Get Transaction History for the logged-in user
app.get('/transactions', authenticateToken, (req, res) => {
  try {
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const userId = decoded.userId;
    const query = 'SELECT * FROM inspection_logs WHERE passenger = ? ORDER BY scanned_datetime DESC';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error fetching transaction history' });
      }
      return res.status(200).json(results);
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Check Balance Endpoint
app.post('/check-balance', authenticateToken, (req, res) => {
  const { tagId, fare } = req.body;
  if (!tagId || fare == null) {
    return res.status(400).json({ message: 'Missing tagId or fare in request' });
  }

  const query = 'SELECT balance FROM users WHERE tag_id = ?';
  db.query(query, [tagId], (err, results) => {
    if (err) {
      console.error('Database error on balance check:', err);
      return res.status(500).json({ message: 'Error checking balance' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No user linked to this NFC card' });
    }
    const balance = parseFloat(results[0].balance);
    const fareAmount = parseFloat(fare);
    
    if (balance < fareAmount) {
      return res.status(400).json({ message: 'Insufficient balance', balance });
    } else {
      return res.status(200).json({ message: 'Sufficient balance', balance });
    }
  });
});

// API Endpoint: GET /transaction-history
app.get('/transaction-history', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const query = `
    SELECT id, inspection_id, passenger_type, tag_id, scanned_datetime, fare, origin, destination 
    FROM inspection_logs
    WHERE passenger = ?
    ORDER BY scanned_datetime DESC
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching transaction history:', err);
      return res.status(500).json({ message: 'Error fetching transaction history' });
    }
    return res.status(200).json(results);
  });
});

// API Endpoint: GET /inspection-logs
app.get('/inspection-logs', authenticateToken, (req, res) => {
  const inspectorId = req.user.userId;
  const query = `
    SELECT id, start_datetime, driver, plate, total_claimed_money, origin, destination
    FROM inspections
    WHERE inspector_id = ?
    ORDER BY start_datetime DESC
  `;
  db.query(query, [inspectorId], (err, results) => {
    if (err) {
      console.error('Error fetching inspection logs:', err);
      return res.status(500).json({ message: 'Error fetching inspection logs' });
    }
    return res.status(200).json(results);
  });
});


// API Endpoint: GET /activity-logs
app.get('/activity-logs', authenticateToken, (req, res) => {
  const query = `
    SELECT id, start_datetime, driver, plate, inspector_fullname, total_claimed_money, origin, destination
    FROM inspections
    ORDER BY start_datetime DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching activity logs:', err);
      return res.status(500).json({ message: 'Error fetching activity logs' });
    }
    return res.status(200).json(results);
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
