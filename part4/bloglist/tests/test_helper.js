const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
]

// all blogs in the test database, as plain objects (with "id", like the API returns)
const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

// a valid id that no blog in the database has
const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', url: 'https://example.com' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

module.exports = { initialBlogs, blogsInDb, nonExistingId }
