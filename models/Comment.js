// models/Comment.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  address: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema);
