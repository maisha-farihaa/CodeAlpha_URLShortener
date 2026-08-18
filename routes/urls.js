const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const { getDb, saveDb } = require('../db');

const CODE_LENGTH = 6;

// runs a SELECT query and returns matching rows as plain objects
function selectAll(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function selectOne(sql, params = []) {
  const rows = selectAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// POST /api/shorten
router.post('/shorten', (req, res) => {
  const { url, customCode } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Please provide a "url" field in the request body.' });
  }

  if (!validUrl.isWebUri(url)) {
    return res.status(400).json({ error: 'The provided URL is not valid. Make sure it starts with http:// or https://' });
  }

  let shortCode = customCode ? customCode.trim() : nanoid(CODE_LENGTH);

  if (customCode) {
    const existing = selectOne('SELECT * FROM urls WHERE short_code = ?', [shortCode]);
    if (existing) {
      return res.status(409).json({ error: 'That custom code is already taken. Please choose another one.' });
    }
  }

  let attempt = 0;
  while (!customCode && selectOne('SELECT * FROM urls WHERE short_code = ?', [shortCode])) {
    shortCode = nanoid(CODE_LENGTH);
    attempt++;
    if (attempt > 5) break;
  }

  const db = getDb();
  db.run('INSERT INTO urls (short_code, original_url) VALUES (?, ?)', [shortCode, url]);
  saveDb();

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.status(201).json({
    shortCode,
    shortUrl: `${baseUrl}/${shortCode}`,
    originalUrl: url
  });
});

// GET /api/stats/:code
router.get('/stats/:code', (req, res) => {
  const row = selectOne(
    'SELECT short_code, original_url, clicks, created_at FROM urls WHERE short_code = ?',
    [req.params.code]
  );

  if (!row) {
    return res.status(404).json({ error: 'Short code not found.' });
  }

  res.json(row);
});

// GET /api/urls
router.get('/urls', (req, res) => {
  const rows = selectAll('SELECT short_code, original_url, clicks, created_at FROM urls ORDER BY created_at DESC');
  res.json(rows);
});

module.exports = router;