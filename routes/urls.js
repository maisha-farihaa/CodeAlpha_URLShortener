const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const db = require('../db');

const CODE_LENGTH = 6;

// POST /api/shorten
router.post('/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Please provide a "url" field in the request body.' });
  }

  if (!validUrl.isWebUri(url)) {
    return res.status(400).json({ error: 'The provided URL is not valid. Make sure it starts with http:// or https://' });
  }

  let shortCode = nanoid(CODE_LENGTH);
  let attempt = 0;
  while (db.prepare('SELECT * FROM urls WHERE short_code = ?').get(shortCode)) {
    shortCode = nanoid(CODE_LENGTH);
    attempt++;
    if (attempt > 5) break;
  }

  const insert = db.prepare('INSERT INTO urls (short_code, original_url) VALUES (?, ?)');
  insert.run(shortCode, url);

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.status(201).json({
    shortCode,
    shortUrl: `${baseUrl}/${shortCode}`,
    originalUrl: url
  });
});

module.exports = router;
