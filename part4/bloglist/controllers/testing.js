const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

// empties the database before each end-to-end test (only exists in test mode, see app.js)
testingRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = testingRouter
