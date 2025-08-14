const assert = require("node:assert")
const bcrypt = require("bcrypt")
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const helper = require("./test_helper")
const Blog = require("../models/blog")
const User = require("../models/user")

const api = supertest(app)

const initialBlogs = [
    {
        author: "Pekkis",
        title: "AI",
        url: "www.ai.com",
        likes: 0
    },
    {
        author: "Jakkis",
        title: "Food",
        url: "www.food.com",
        likes: 0
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test("blogs are returned as json", async () => {
    await api
        .get("/api/blogs")
        .expect(200)
        .expect("Content-Type", /application\/json/)
})

test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs")
    assert.strictEqual(response.body.length, initialBlogs.length)
})

test("a specifig blog is within the returned blogs", async () => {
    const response = await api.get("/api/blogs")

    const titles = response.body.map(e => e.title)
    assert.ok(titles.includes("AI"))
})

test("a valid blog can be added and blog count increases by one", async () => {
    const blogsAtStart = await api.get("/api/blogs")
    const newBlog = {
        author: "Bebbis",
        title: "Beebelson",
        url: "www.beebel.com",
        likes: 0
    }

    const postResponse = await api
        .post ("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/)
    
    const addedBlog = postResponse.body

    assert.strictEqual(addedBlog.author, newBlog.author)
    assert.strictEqual(addedBlog.title, newBlog.title)
    assert.strictEqual(addedBlog.url, newBlog.url)
    assert.strictEqual(addedBlog.likes, 0)

    const blogsAtEnd = await api.get("/api/blogs")
    assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length + 1)

    const titles = blogsAtEnd.body.map(blog => blog.title)
    assert.ok(titles.includes("Beebelson"))
})

test("blogs have id field instead of _id", async () => {
    const response = await api.get("/api/blogs")
    const blogs = response.body

    blogs.forEach(blog => {
        assert.ok(blog.id, "idfield should be defined")
        assert.strictEqual(blog._id, undefined, "_id should not be present")
    })
})

test("blog creation fails with 400 if title is missing", async () => {
    const blogWithoutTitle = {
        author: "Blogger",
        url: "www.blogger.com",
        likes: 0
    }
    await api
        .post("/api/blogs")
        .send(blogWithoutTitle)
        .expect(400)
})

test("blog creation fails with 400 if url is missing", async () => {
    const blogWithoutUrl = {
        author: "Blogger",
        title: "Blogging",
        likes: 0
    }
    await api
        .post("/api/blogs")
        .send(blogWithoutUrl)
        .expect(400)
})

test("a blog can be deleted", async () => {
    const blogsAtStart = await api.get("/api/blogs")
    const blogToDelete = blogsAtStart.body[0]

    await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

    const blogsAtEnd = await api.get("/api/blogs")
    assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length -1)
    const titles = blogsAtEnd.body.map(blog => blog.title)
    assert.ok(!titles.includes(blogToDelete.title))
})

test("a blog's likes can be updated", async () => {
    const blogsAtStart = await api.get("/api/blogs")
    const blogToUpdate = blogsAtStart.body[0]

    const updatedLikes = blogToUpdate.likes + 1
    const updatedBlogData = {
        ...blogToUpdate,
        likes: updatedLikes
    }

    const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlogData)
        .expect(200)
        .expect("Content-Type", /application\/json/)
    
    assert.strictEqual(response.body.likes, updatedBlogData.likes)

    const blogsAtEnd = await api.get("/api/blogs")
    const updatedBlog = blogsAtEnd.body.find(b => b.id === blogToUpdate.id)
    assert.strictEqual(updatedBlog.likes, updatedBlogData.likes)
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'hdee', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Deebelson',
      name: 'Mikael Huovinen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hdee',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    console.log('Virhe:', result.body.error)
    assert.match(result.body.error, /duplicate key|username.*unique/i)
    //assert(result.body.error.includes("expected `username` to be unique"))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
    await mongoose.connection.close()
})