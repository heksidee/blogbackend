const blogsRouter = require("express").Router()
const Blog = require("../models/blog")

blogsRouter.get('/', (request, response) => {
  Blog.find({}).then(blogs => {
    response.json(blogs)
  })
})

blogsRouter.get('/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
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
    response.json(savedBlog)
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

module.exports = blogsRouter