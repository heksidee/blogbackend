const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  const mostLiked = blogs.reduce((fav, current) => (current.likes > fav.likes ? current : fav));
  return mostLiked.title;
};

const mostBlogs = (blogs) => {
  const grouped = _.countBy(blogs, 'author');
  const authorMost = Object.entries(grouped).reduce((max, curr) => (curr[1] > max[1] ? curr : max));
  return {
    author: authorMost[0],
    blogs: authorMost[1],
  };
};

const mostLikes = (blogs) => {
  const grouped = _.groupBy(blogs, 'author');
  const likesPerAuthor = _.map(grouped, (blogs, author) => ({
    author,
    likes: _.sumBy(blogs, 'likes'),
  }));
  return _.maxBy(likesPerAuthor, 'likes');
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
