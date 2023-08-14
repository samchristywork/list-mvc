var express = require('express');
var app = express();
var morgan = require('morgan');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.static('public'));
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

app.get('/list/:id', (req, res) => {
  let listId = req.params.id;

  db.all("SELECT * FROM items WHERE list_id = ? and show = 1", [listId], (err, rows) => {
    if (err) throw err;
    res.render('list', { items: rows, listId: listId });
  });
});

app.post('/add-list', (req, res) => {
  let title = req.body.title;

  db.run("INSERT INTO lists (title) VALUES (?)", [title], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.get('/remove-list/:id', (req, res) => {
  let listId = req.params.id;

  db.run("UPDATE lists SET show = 0 WHERE id = ?", [listId], (err) => {
    if (err) throw err;
    db.run("UPDATE items SET show = 0 WHERE list_id = ?", [listId], (err) => {
      if (err) throw err;
      res.redirect('/');
    });
  });
});

app.post('/list/:id/add-item', (req, res) => {
  let content = req.body.content;
  let listId = req.params.id;

  db.run("INSERT INTO items (list_id, content) VALUES (?, ?)", [listId, content], (err) => {
    if (err) throw err;
    res.redirect(`/list/${listId}`);
  });
});

app.get('/list/:id/delete-item/:itemId', (req, res) => {
  let listId = req.params.id;
  let itemId = req.params.itemId;

  db.run("UPDATE items SET show = 0 WHERE id = ?", [itemId], (err) => {
    if (err) throw err;
    res.redirect(`/list/${listId}`);
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
