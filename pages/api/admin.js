// pages/api/admin.js

const express = require('express');
const User = require('../../models/User.js');  // Import your User model
const connectDB = require('../../db.js'); // MongoDB connection utility
const { getSession } = require('../../utils/auth.js'); // Utility function to check session

const router = express.Router();

router.get('/api/admin/users', async (req, res) => {
  await connectDB(); // Ensure that your DB connection is established

  // Check if the user is authenticated
  const session = getSession(req); // Function to retrieve session information
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized access.' }); // Send an Unauthorized response if not authenticated
  }

  try {
    console.log('Fetching users...');
    const users = await User.find().populate('campaigns'); // Fetch users from the database
    console.log('Users fetched:', users);
    res.status(200).json({ users }); // Send back the users data
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Server error'); // Handle any server error
  }
});

module.exports = router; // Export the router using CommonJS syntax
