const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  author: String,
  title: String,
  url: String,
  likes: Number,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  comments: [String],
});

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Blog', blogSchema);
