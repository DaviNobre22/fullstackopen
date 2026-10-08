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

blogsRouter.delete('/:id', async (request, response) => {
  // an invalid id makes this throw a CastError -> 400
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body || {}

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).end()
  }

  // only the fields that were sent are changed, e.g. just { likes: 8 }
  if (title !== undefined) blog.title = title
  if (author !== undefined) blog.author = author
  if (url !== undefined) blog.url = url
  if (likes !== undefined) blog.likes = likes

  // save() runs the schema validators, so e.g. an empty title is rejected with 400
  const updatedBlog = await blog.save()
  response.json(updatedBlog)
})

module.exports = blogsRouter
