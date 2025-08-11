const assert = require("node:assert")
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require("../models/blog")

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

test("a valid blog can be added", async () => {
    const newBlog = {
        author: "Bebbis",
        title: "Beebelson",
        url: "www.beebel.com",
        likes: 0
    }

    await api
        .post ("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/)
    
    const response = await api.get("/api/blogs")
    const titles = response.body.map(blog => blog.title)
    assert.strictEqual(response.body.length, initialBlogs.length + 1)
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

after(async () => {
    await mongoose.connection.close()
})