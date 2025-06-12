require("dotenv").config()
const express = require("express")
const app = express()
const Blog = require("./models/blog")

let blogs = [
    {
      "id": "1",
      "author": "Gerhard",
      "title": "AI",
      "url": "www.aiblogs.com",
      "likes": 5
    },
    {
      "id": "2",
      "author": "Kimmo",
      "title": "Developping",
      "url": "www.devblogs.com",
      "likes": 6
    },
    {
      "id": "3",
      "author": "Ziggy",
      "title": "Reggae",
      "url": "www.reggaeblogs.com",
      "likes": 6
    }
]

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.json())
app.use(requestLogger)
app.use(express.static('dist'))

app.get("/api/blogs", (request, response) => {
    Blog.find({}).then(blogs => {
        response.json(blogs)
    })
})

app.get(`/api/blogs/:id`, (request, response) => {
    Blog.findById(request.params.id).then(blog => {
        response.json(blog)
    }) 
})

app.post("/api/blogs", (request, response) => {
    const body = request.body
    
    if(!body.author || !body.title || !body.url) {
        return response.status(400).json({ error: "content missing" }) 
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

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
