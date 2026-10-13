/**
 * Cloud-Powered Task Manager
 * CRUD web app backed by IBM Cloudant NoSQL Database.
 *
 * Falls back to an in-memory store automatically when Cloudant
 * credentials are not present, so the app runs locally out of the box,
 * then switches to real cloud storage once CLOUDANT_URL / CLOUDANT_APIKEY
 * are set in .env.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');

const { ensureDatabaseExists, useCloudant } = require('./config/cloudant');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

const fs = require('fs');

app.use(express.json());

// Serve built React frontend from client/dist
const clientDist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

// Mount task API routes under /api
app.use('/api', taskRoutes);

// Serve index.html for client-side routing on non-API requests
if (fs.existsSync(clientDist)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Central error handler
app.use(errorHandler);

ensureDatabaseExists()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Task Manager running at http://localhost:${PORT}`);
      console.log(`Storage backend: ${useCloudant ? 'IBM Cloudant' : 'In-memory (set CLOUDANT_URL & CLOUDANT_APIKEY in .env to switch)'}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });
