require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initDb, getDb, saveDb } = require('./db');
const urlRoutes = require('./routes/urls');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', urlRoutes);

// GET /:code -> redirects to the original long URL
app.get('/:code', (req, res, next) => {
  const { code } = req.params;

  if (code.includes('.')) return next();

  const db = getDb();
  const stmt = db.prepare('SELECT * FROM urls WHERE short_code = ?');
  stmt.bind([code]);

  if (!stmt.step()) {
    stmt.free();
    return res.status(404).send('Short URL not found.');
  }

  const row = stmt.getAsObject();
  stmt.free();

  db.run('UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?', [code]);
  saveDb();

  res.redirect(row.original_url);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// sql.js needs to load its WASM engine first, so we wait for that before listening
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`URL Shortener server running on http://localhost:${PORT}`);
  });
});