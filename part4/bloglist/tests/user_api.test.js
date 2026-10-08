const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    // make sure the unique index on username exists before the tests use it
    await User.init()

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'Superuser', passwordHash })
    await user.save()
  })

  test('users are returned as json, without password hashes', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 1)
    assert.strictEqual(response.body[0].username, 'root')
    assert.strictEqual(response.body[0].passwordHash, undefined)
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.passwordHash, undefined)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((user) => user.username)
    assert(usernames.includes(newUser.username))
  })

  test('the password is stored as a bcrypt hash', async () => {
    await api
      .post('/api/users')
      .send({ username: 'hashcheck', name: 'Hash Check', password: 'salainen' })
      .expect(201)

    const saved = await User.findOne({ username: 'hashcheck' })
    assert.notStrictEqual(saved.passwordHash, 'salainen')
    assert(await bcrypt.compare('salainen', saved.passwordHash))
  })

  // each invalid user: what is sent, and a piece of the expected error message
  const invalidUsers = [
    {
      description: 'username is already taken',
      user: { username: 'root', name: 'Superuser', password: 'salainen' },
      error: 'expected `username` to be unique',
    },
    {
      description: 'username is missing',
      user: { name: 'No Username', password: 'salainen' },
      error: 'username',
    },
    {
      description: 'username is shorter than 3 characters',
      user: { username: 'ab', name: 'Short', password: 'salainen' },
      error: 'shorter than the minimum allowed length (3)',
    },
    {
      description: 'password is missing',
      user: { username: 'nopassword', name: 'No Password' },
      error: 'password must be at least 3 characters long',
    },
    {
      description: 'password is shorter than 3 characters',
      user: { username: 'shortpassword', name: 'Short Password', password: 'ab' },
      error: 'password must be at least 3 characters long',
    },
  ]

  invalidUsers.forEach(({ description, user, error }) => {
    test(`creation fails with status 400 if ${description}`, async () => {
      const usersAtStart = await helper.usersInDb()

      const response = await api
        .post('/api/users')
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(response.body.error.includes(error), `got: ${response.body.error}`)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
