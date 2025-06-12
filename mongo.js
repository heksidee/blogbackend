const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://blogcollection:${password}@cluster0.y9hmhv7.mongodb.net/blogApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const blogSchema = new mongoose.Schema({
  author: String,
  title: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog({
  author: 'Gerhard',
  title: 'AI',
  url: 'www.aiblogs.com',
  likes: 0
})

/*blog.save().then(result => {
  console.log('blog saved!')
  mongoose.connection.close()
})*/

Blog.find({}).then(result => {
  result.forEach(blog => {
    console.log(blog)
  })
  mongoose.connection.close()
})