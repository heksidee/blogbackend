const express = require('express')
const mongoose = require('mongoose')
const config = require("./utils/config")
const { info, error } = require("./utils/logger")
const blogsRouter = require("./controllers/blogs")
const middleware = require("./utils/middleware")

const app = express()

info("connecting to", config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    info('connected to MongoDB')
  })
  .catch((err) => {
    error('error connecting to MongoDB:', err.message)
  })

app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use("/api/blogs", blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app