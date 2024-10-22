const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'grocery_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(__dirname + '/public/landing.html'));
app.get('/login', (req, res) => res.sendFile(__dirname + '/public/login.html'));
app.get('/dashboard', (req, res) => res.sendFile(__dirname + '/public/dashboard.html'));
app.get('/add', (req, res) => res.sendFile(__dirname + '/public/add.html'));
app.get('/edit', (req, res) => res.sendFile(__dirname + '/public/edit.html'));

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.redirect('/dashboard');
        } else {
            res.send('Invalid login');
        }
    });
});

// Display stocks
app.get('/stocks', (req, res) => {
    connection.query('SELECT * FROM stocks', (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

// Add stock
app.post('/add-stock', (req, res) => {
    const { name, quantity } = req.body;
    connection.query('INSERT INTO stocks (name, quantity) VALUES (?, ?)', [name, quantity], (err, results) => {
        if (err) throw err;
        res.redirect('/dashboard');
    });
});

// Edit stock
app.post('/edit-stock', (req, res) => {
    const { id, name, quantity } = req.body;
    connection.query('UPDATE stocks SET name = ?, quantity = ? WHERE id = ?', [name, quantity, id], (err, results) => {
        if (err) throw err;
        res.redirect('/dashboard');
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
