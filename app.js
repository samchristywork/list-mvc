const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const root = "/list-mvc";

app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use('/list-mvc', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database('./db/lists.db');
db.run("CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY, title TEXT, description TEXT, show BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, list_id INTEGER, show BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, content TEXT, FOREIGN KEY(list_id) REFERENCES lists(id))");

app.get(root + '/', (_req, res) => {
  db.all("SELECT * FROM lists WHERE show = 1", (err, rows) => {
    if (err) throw err;
    res.render('index', { lists: rows });
  });
});

app.get(root + '/admin', (_req, res) => {
  db.all("SELECT * FROM lists WHERE show = 0", (err, rows) => {
    if (err) throw err;
    res.render('admin', { lists: rows });
  });
});

app.get(root + '/list/:id', (req, res) => {
  let listId = req.params.id;
  let listName = '';
  let listDescription = '';

  db.get("SELECT * FROM lists WHERE id = ?", [listId], (err, row) => {
    if (err) throw err;
    listName = row.title;
    listDescription = row.description;

    if (listDescription == null) {
      listDescription = '';
    }

    if (listDescription == '') {
      listDescription = 'No description';
    }

    db.all("SELECT * FROM items WHERE list_id = ? and show = 1", [listId], (err, rows) => {
      if (err) throw err;
      res.render('list', { items: rows, listId: listId, listName: listName, listDescription: listDescription });
    });
  });
});

app.post(root + '/add-list', (req, res) => {
  let title = req.body.title;

  if (title == '') {
    res.redirect(root + '/');
    return;
  }

  db.run("INSERT INTO lists (title) VALUES (?)", [title], (err) => {
    if (err) throw err;
    res.redirect(root + '/');
  });
});

app.get(root + '/remove-list/:id', (req, res) => {
  let listId = req.params.id;

  db.run("UPDATE lists SET show = 0 WHERE id = ?", [listId], (err) => {
    if (err) throw err;
    db.run("UPDATE items SET show = 0 WHERE list_id = ?", [listId], (err) => {
      if (err) throw err;
      res.redirect(root + '/');
    });
  });
});

app.post(root + '/list/:id/add-item', (req, res) => {
  let content = req.body.content;
  let listId = req.params.id;

  if (content == '') {
    res.redirect(root + `/list/${listId}`);
    return;
  }

  db.run("INSERT INTO items (list_id, content) VALUES (?, ?)", [listId, content], (err) => {
    if (err) throw err;
    res.redirect(root + `/list/${listId}`);
  });
});

app.get(root + '/list/:id/delete-item/:itemId', (req, res) => {
  let listId = req.params.id;
  let itemId = req.params.itemId;

  db.run("UPDATE items SET show = 0 WHERE id = ?", [itemId], (err) => {
    if (err) throw err;
    res.redirect(root + `/list/${listId}`);
  });
});

app.post(root + '/list/:id/edit-description', (req, res) => {
  let listId = req.params.id;
  let newDescription = req.body.description;

  db.run("UPDATE lists SET description = ? WHERE id = ?", [newDescription, listId], (err) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000' + root);
});
