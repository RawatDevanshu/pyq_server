const mongoose = require('mongoose');
const {Schema} = mongoose;

const paperSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  course:{
    type: String,
    required: true
  },
  semester:{
    type: Number,
    required: true
  },
  term:{
    type: String,
    required: true
  },
  file: {
    type: String, // Store the file path or URL
    required: true
  },
  owner:{
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

});

const Paper = mongoose.model('Papers', paperSchema);

module.exports = Paper;