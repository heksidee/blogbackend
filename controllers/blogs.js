const jwt = require("jsonwebtoken")
const blogsRouter = require("express").Router()
const Blog = require("../models/blog")
const User = require("../models/user")
const { response } = require("express")
const { userExtractor } = require("../utils/middleware")

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
  .find({}).populate("user", { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' })
    }
    response.json(blog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  try {
    const body = request.body

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: request.user._id
    })

    const savedBlog = await blog.save()
    request.user.blogs = request.user.blogs.concat(savedBlog._id)
    await request.user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const { author, title, url, likes } = request.body
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).end()
    }
    blog.author = author
    blog.title = title
    blog.url = url
    blog.likes = likes

    const updatedBlog = await blog.save()
    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete("/:id", userExtractor, async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).json({ error: "Blog not found" })
    }
    
    if (blog.user.toString() !== decodedToken.id) {
      return response.status(403).json({ error: "unauthorized: not the blog owner" })
    }
    await Blog.findByIdAndDelete(request.params.id)

    request.user.blogs = request.user.blogs.filter(b => b.toString() !== blog._id.toString())
    await request.user.save()

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter