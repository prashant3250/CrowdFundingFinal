// pages/api/comments.js

const connectDB = require('../../db'); // Ensure your DB connection utility is imported correctly
const Comment = require('../../models/Comment'); // Import the Comment model

connectDB(); // Connect to MongoDB

export default async function handler(req, res) {
  const { method } = req;
  const { address } = req.query;

  switch (method) {
    case 'GET':
      try {
        const campaignComments = await Comment.find({ address }).sort({ createdAt: -1 }); // Fetch comments from MongoDB
        res.status(200).json(campaignComments);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching comments.' });
      }
      break;

    case 'POST':
      const { comment } = req.body;

      if (!comment || !address) {
        res.status(400).json({ error: "Comment and campaign address are required." });
        return;
      }

      try {
        const newComment = new Comment({ address, text: comment });
        await newComment.save(); // Save comment to MongoDB
        res.status(201).json({ message: "Comment added successfully!" });
      } catch (error) {
        res.status(500).json({ error: 'Error saving comment.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
