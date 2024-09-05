const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');  // Import the User model
const Campaign = require('../../models/Campaign');  // Import the Campaign model
const router = express.Router();

router.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    req.session.user = { id: user._id, email: user.email, name: user.name };
    res.status(201).json({ message: 'User registered successfully.', user: { email, name } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    req.session.user = { id: user._id, email: user.email, name: user.name };
    res.status(200).json({ message: 'Login successful.', user: { email, name: user.name } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/api/profile', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const user = await User.findById(req.session.user.id).populate('campaigns');
    res.status(200).json({ user: { email: user.email, name: user.name, campaigns: user.campaigns } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/api/profile', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { name } = req.body;

  try {
    const user = await User.findById(req.session.user.id);

    if (name) user.name = name;

    await user.save();

    req.session.user.name = name;
    res.status(200).json({ message: 'Profile updated successfully.', user: { email: user.email, name: user.name } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
router.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err.message);
      return res.status(500).send('Server error');
    }
    res.status(200).json({ message: 'Logout successful.' });
  });
});

module.exports = router;
