const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

// creates a user and logs in through the API, returning the user and its token
const createUserAndLogin = async (username) => {
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = await new User({ username, name: username, passwordHash }).save()

  const response = await api
    .post('/api/login')
    .send({ username, password: 'sekret' })
    .expect(200)

  return { user, token: response.body.token }
}

let token
let otherToken

// every test starts from two users and the same two blogs, both created by "root"
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const root = await createUserAndLogin('root')
  token = root.token
  otherToken = (await createUserAndLogin('other')).token

  const blogs = await Blog.insertMany(
    helper.initialBlogs.map((blog) => ({ ...blog, user: root.user._id }))
  )
  root.user.blogs = blogs.map((blog) => blog._id)
  await root.user.save()
})

describe('getting blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned, without a token', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('the unique identifier of a blog is named id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]

    assert.ok(blog.id)
    assert.strictEqual(blog._id, undefined)
  })

  test('each blog shows its creator', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body[0].user.username, 'root')
    assert.strictEqual(response.body[0].user.passwordHash, undefined)
  })
})

describe('adding a blog', () => {
  const newBlog = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  }

  test('succeeds with valid data and a valid token', async () => {
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const saved = blogsAtEnd.find((blog) => blog.title === newBlog.title)
    assert.deepStrictEqual(
      { title: saved.title, author: saved.author, url: saved.url, likes: saved.likes },
      newBlog
    )

    // the logged-in user is the creator, and the blog is in that user's list
    const root = await User.findOne({ username: 'root' })
    assert.strictEqual(response.body.user, root._id.toString())
    assert(root.blogs.map((id) => id.toString()).includes(response.body.id))
  })

  test('fails with status 401 if no token is given', async () => {
    const response = await api.post('/api/blogs').send(newBlog).expect(401)

    assert.strictEqual(response.body.error, 'token missing')

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status 401 if the token is invalid', async () => {
    const response = await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer not-a-real-token')
      .send(newBlog)
      .expect(401)

    assert.strictEqual(response.body.error, 'token invalid')
  })

  test('without likes gets 0 likes', async () => {
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'First class tests', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/' })
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('without title fails with status 400', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/' })
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('without url fails with status 400', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Type wars', author: 'Robert C. Martin' })
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('deleting a blog', () => {
  test('succeeds with status 204 for the creator', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    assert(!blogsAtEnd.map((blog) => blog.id).includes(blogToDelete.id))

    // the blog is also removed from its creator's list
    const root = await User.findOne({ username: 'root' })
    assert(!root.blogs.map((id) => id.toString()).includes(blogToDelete.id))
  })

  test('fails with status 401 if no token is given', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api.delete(`/api/blogs/${blogsAtStart[0].id}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status 403 for a user who did not create it', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api
      .delete(`/api/blogs/${blogsAtStart[0].id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status 404 if the blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('fails with status 400 if the id is malformatted', async () => {
    await api
      .delete('/api/blogs/12345')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('updating a blog', () => {
  test('succeeds in changing the number of likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: blogToUpdate.likes + 1 })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)

    const updatedInDb = (await helper.blogsInDb()).find((blog) => blog.id === blogToUpdate.id)
    assert.deepStrictEqual(updatedInDb, { ...blogToUpdate, likes: blogToUpdate.likes + 1 })
  })

  test('fails with status 404 if the blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api.put(`/api/blogs/${validNonexistingId}`).send({ likes: 1 }).expect(404)
  })

  test('fails with status 400 if the id is malformatted', async () => {
    await api.put('/api/blogs/12345').send({ likes: 1 }).expect(400)
  })

  test('fails with status 400 if the title is made empty', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api.put(`/api/blogs/${blogsAtStart[0].id}`).send({ title: '' }).expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.deepStrictEqual(blogsAtEnd, blogsAtStart)
  })
})

after(async () => {
  await mongoose.connection.close()
})
