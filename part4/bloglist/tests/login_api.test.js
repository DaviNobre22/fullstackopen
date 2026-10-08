const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

describe('logging in', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    await new User({ username: 'root', name: 'Superuser', passwordHash }).save()
  })

  test('succeeds with the right password and returns a token', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.username, 'root')
    assert.strictEqual(response.body.name, 'Superuser')

    // the token is signed with SECRET and carries the user's username and id
    const decoded = jwt.verify(response.body.token, process.env.SECRET)
    const user = await User.findOne({ username: 'root' })
    assert.strictEqual(decoded.username, 'root')
    assert.strictEqual(decoded.id, user._id.toString())
  })

  test('fails with status 401 if the password is wrong', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'wrong' })
      .expect(401)

    assert.strictEqual(response.body.error, 'invalid username or password')
    assert.strictEqual(response.body.token, undefined)
  })

  test('fails with status 401 if the user does not exist', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'nobody', password: 'sekret' })
      .expect(401)

    assert.strictEqual(response.body.error, 'invalid username or password')
  })
})

after(async () => {
  await mongoose.connection.close()
})
