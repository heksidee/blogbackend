require('dotenv').config()
const express = require('express')
const app = express()
const Blog = require('./models/blog')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

app.get('/api/blogs', (request, response) => {
  Blog.find({}).then(blogs => {
    response.json(blogs)
  })
})

app.get('/api/blogs/:id', (request, response, next) => {
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

app.post('/api/blogs', (request, response) => {
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
})

app.put('/api/blogs/:id', (request, response, next) => {
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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
