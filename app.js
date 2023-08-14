var express = require('express');
var app = express();
var morgan = require('morgan');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database('./db/lists.db');
db.run("CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY, title TEXT, show BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, list_id INTEGER, show BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, content TEXT, FOREIGN KEY(list_id) REFERENCES lists(id))");

app.get('/', (_req, res) => {
  db.all("SELECT * FROM lists WHERE show = 1", (err, rows) => {
    if (err) throw err;
    res.render('index', { lists: rows });
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
