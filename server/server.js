const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,  '..', 'public', 'View')); // Set views directory


// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your database username
    password: 'root', // Replace with your database password
    database: 'grocery_shop' // Replace with your database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Define routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'LandingPage', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'Login', 'index.html')));
app.get('/add', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'Add', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'Dashboard', 'index.html')));
app.get('/update', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'Edit', 'index.html')));

// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query to check username and password
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?'; // Ensure you hash your passwords in production
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        if (results.length > 0) {
            // User found, redirect to dashboard
            res.redirect('/dashboard');
        } else {
            // Redirect back to login with an error message
            res.redirect(`/login?error=1`);
        }
    });
});


// Handle adding stock
app.post('/add', (req, res) => {
    const { item, quantity, price } = req.body;

    // Query to insert a new stock item
    const query = 'INSERT INTO stocks (name, quantity, price) VALUES (?, ?, ?)';
    db.query(query, [item, quantity, price], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        // Redirect back to the add page with a success message
        res.redirect(`/add?success=1`);
    });
});


// Handle viewing stocks
app.get('/view', (req, res) => {
    const query = 'SELECT * FROM stocks';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        // Render the view with the fetched stock data
        res.render('view', { stocks: results });
    });
});


// Update stock route
app.post('/update', (req, res) => {
    const { item, quantity, price } = req.body;

    const query = 'UPDATE stocks SET quantity = ?, price = ? WHERE name = ?';
    db.query(query, [quantity, price, item], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        if (results.affectedRows > 0) {
            res.send('Stock updated successfully!');
        } else {
            res.send('Stock not found or no changes made.');
        }
    });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
