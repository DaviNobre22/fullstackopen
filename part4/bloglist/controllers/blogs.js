const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

// the paths are relative to where the router is used: '/' here is '/api/blogs'
// Express 5 passes errors from async handlers to the error handler by itself,
// so no try/catch is needed here
blogsRouter.get('/', async (request, response) => {
  // replace each blog's user id with that user's username and name
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body || {}

  // for now any user is the creator (exercise 4.17); 4.19 uses the logged-in user
  const user = await User.findOne({})

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id,
  })

  // a missing title or url makes save() throw a ValidationError -> 400
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

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
