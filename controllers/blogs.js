const blogsRouter = require("express").Router()
const { EventEmitterAsyncResource } = require("supertest/lib/test")
const Blog = require("../models/blog")

blogsRouter.get('/', (request, response) => {
  Blog.find({}).then(blogs => {
    response.json(blogs)
  })
})

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', (request, response, next) => {
  const body = request.body

  if (!body.author || !body.title || !body.url) {
    return response.status(400).json({ error: 'content missing' })
  }

  const blog = new Blog({
    author: body.author,
    title: body.title,
    url: body.url,
    likes: 0
  })

  blog.save().then(savedBlog => {
    response.status(201).json(savedBlog)
  })
  .catch(error => next(error))
})

blogsRouter.put('/:id', (request, response, next) => {
  const { author, title, url, likes } = request.body

  Blog.findById(request.params.id)
    .then(blog => {
      if (!blog) {
        return response.status(404).end()
      }
      blog.author = author
      blog.title = title
      blog.url = url
      blog.likes = likes

      return blog.save().then((updatedBlog) => {
        response.json(updatedBlog)
      })
    })
    .catch(error => next(error))
})

blogsRouter.delete("/:id", async (request, response, next) => {
  try {
    const deleteBlog = await Blog.findByIdAndDelete(request.params.id)
    if (!deleteBlog) {
      return response.status(204).json({ error: "Blog not found" })
    }
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter