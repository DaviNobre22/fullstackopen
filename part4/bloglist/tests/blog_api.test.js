const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

// every test starts from the same two blogs
beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('getting blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('the unique identifier of a blog is named id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]

    assert.ok(blog.id)
    assert.strictEqual(blog._id, undefined)
  })
})

describe('adding a blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    }

    await api
      .post('/api/blogs')
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
  })

  test('without likes gets 0 likes', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    }

    const response = await api.post('/api/blogs').send(newBlog).expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('without title fails with status 400', async () => {
    const newBlog = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('without url fails with status 400', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('deleting a blog', () => {
  test('succeeds with status 204 if the id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const ids = blogsAtEnd.map((blog) => blog.id)
    assert(!ids.includes(blogToDelete.id))
  })

  test('fails with status 400 if the id is malformatted', async () => {
    await api.delete('/api/blogs/12345').expect(400)

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
      .send({ ...blogToUpdate, likes: blogToUpdate.likes + 1 })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)

    const updatedInDb = (await helper.blogsInDb()).find((blog) => blog.id === blogToUpdate.id)
    assert.deepStrictEqual(updatedInDb, { ...blogToUpdate, likes: blogToUpdate.likes + 1 })
  })

  test('with only likes keeps the other fields', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[1]

    await api.put(`/api/blogs/${blogToUpdate.id}`).send({ likes: 42 }).expect(200)

    const updatedInDb = (await helper.blogsInDb()).find((blog) => blog.id === blogToUpdate.id)
    assert.deepStrictEqual(updatedInDb, { ...blogToUpdate, likes: 42 })
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
