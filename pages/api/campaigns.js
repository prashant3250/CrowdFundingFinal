// pages/api/campaigns.js

const express = require('express');
const Campaign = require('../../models/Campaign');
const User = require('../../models/User');
const router = express.Router();

router.post('/api/campaigns', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in to create a campaign.' });
  }

  const { name, description, minimumContribution } = req.body;

  try {
    const user = await User.findById(req.session.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const campaign = new Campaign({
      name,
      description,
      minimumContribution,
      creator: user._id
    });

    await campaign.save();

    user.campaigns.push(campaign._id);
    await user.save();

    res.status(201).json({ message: 'Campaign created successfully.', campaign });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
