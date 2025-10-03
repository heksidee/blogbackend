const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor, tokenExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 });
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' });
    }
    response.json(blog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.post('/', userExtractor, tokenExtractor, async (request, response) => {
  try {
    const { title, url, author, likes } = request.body;

    if (!title || !url) {
      return response.status(400).json({ error: 'title and url are required' });
    }

    const blog = new Blog({
      title,
      author,
      url,
      likes: likes || 0,
      user: request.user._id,
    });

    const savedBlog = await blog.save();
    const populatedBlog = await savedBlog.populate('user', { username: 1, name: 1 });
    request.user.blogs = request.user.blogs.concat(savedBlog._id);
    await request.user.save();

    response.status(201).json(populatedBlog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.put('/:id', userExtractor, tokenExtractor, async (request, response, next) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { likes: request.body.likes },
      { new: true, runValidators: true, context: 'query' }
    ).populate('user', { username: 1, name: 1 });

    response.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete('/:id', userExtractor, tokenExtractor, async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id);
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' });
    }

    if (!blog.user || blog.user.toString() !== request.user._id.toString()) {
      return response.status(403).json({ error: 'unauthorized: not the blog owner' });
    }
    await Blog.findByIdAndDelete(request.params.id);

    if (!Array.isArray(request.user.blogs)) {
      request.user.blogs = request.user.blogs.filter((b) => b.toString() !== blog._id.toString());
      await request.user.save();
    }

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

blogsRouter.post('/:id/comments', async (request, response, next) => {
  try {
    const { comment } = request.body;
    const blog = await Blog.findById(request.params.id);

    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' });
    }
    blog.comments = blog.comments.concat(comment);
    const updatedBlog = await blog.save();

    response.status(202).json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
