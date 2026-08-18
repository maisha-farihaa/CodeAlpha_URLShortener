require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db');
const urlRoutes = require('./routes/urls');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', urlRoutes);

// redirect short code to original url
app.get('/:code', (req, res, next) => {
  const { code } = req.params;

  if (code.includes('.')) return next();

  const row = db.prepare('SELECT * FROM urls WHERE short_code = ?').get(code);

  if (!row) {
    return res.status(404).send('Short URL not found.');
  }

  db.prepare('UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?').run(code);
  res.redirect(row.original_url);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`URL Shortener server running on http://localhost:${PORT}`);
});
