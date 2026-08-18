# URL Shortener

A simple backend project that shortens long URLs into short, shareable links. Built with Node.js, Express, and SQLite as part of the CodeAlpha Backend Development Internship.

## What it does

- Takes a long URL and generates a short code for it
- Visiting the short link redirects you to the original URL
- Keeps track of how many times each link has been clicked
- Comes with a small web page to try it out directly in the browser

## Built with

- Node.js and Express
- SQLite (through the better-sqlite3 package)
- Plain HTML, CSS, and JavaScript for the frontend

## Getting started

1. Install the dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and go to:
   ```
   http://localhost:3000
   ```

The database file is created automatically the first time you run the app.

## API

**POST /api/shorten**
Send a URL, get back a short link.
```
{ "url": "https://example.com/some/long/link" }
```

**GET /:code**
Visiting a short link redirects to the original URL.

**GET /api/urls**
Returns the list of all links created so far.

**GET /api/stats/:code**
Returns details and click count for one specific short link.

## Notes

- URLs must start with `http://` or `https://` to be accepted.
- Made for Task 1 of the CodeAlpha Backend Development Internship.