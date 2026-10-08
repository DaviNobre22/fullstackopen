const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// the paths are relative to where the router is used: '/' here is '/api/blogs'
// Express 5 passes errors from async handlers to the error handler by itself,
// so no try/catch is needed here
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  // a missing title or url makes save() throw a ValidationError -> 400
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

module.exports = blogsRouter
