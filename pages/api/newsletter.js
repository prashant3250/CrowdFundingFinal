// pages/api/newsletter.js

import connectDB from '../../db.js'; // Ensure this file connects to MongoDB
import Subscriber from '../../models/Subscriber.js';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    try {
      // Check if the email already exists
      const existingSubscriber = await Subscriber.findOne({ email });
      if (existingSubscriber) {
        return res.status(400).json({ error: 'This email is already subscribed.' });
      }

      // Create a new subscriber
      const newSubscriber = new Subscriber({ email });
      await newSubscriber.save();

      res.status(201).json({ message: 'Successfully subscribed to our newsletter!' });
    } catch (error) {
      console.error('Error subscribing:', error);
      res.status(500).json({ error: 'An error occurred while subscribing. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
