const express = require('express');
const { createServer } = require("http");
const next = require("next");
const cors = require('cors');
const session = require('express-session');
const routes = require('./routes');
const connectDB = require('./db');
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = routes.getRequestHandler(app);
const expressApp = express();

connectDB();  // Connect to MongoDB

expressApp.use(cors());
expressApp.use(express.json());

expressApp.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Register API routes
const authRoutes = require('./pages/api/auth');
const campaignRoutes = require('./pages/api/campaigns');
const adminRoutes = require('./pages/api/admin');
expressApp.use(authRoutes);
expressApp.use(campaignRoutes);
expressApp.use(adminRoutes);

app.prepare().then(() => {
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  createServer(expressApp).listen(3000, (err) => {
    if (err) throw err;
    console.log("Ready on http://localhost:3000");
  });
});
