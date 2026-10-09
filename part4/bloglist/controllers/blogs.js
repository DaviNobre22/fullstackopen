const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

// the paths are relative to where the router is used: '/' here is '/api/blogs'
// Express 5 passes errors from async handlers to the error handler by itself,
// so no try/catch is needed here

// no login needed to read the blogs
blogsRouter.get('/', async (request, response) => {
  // replace each blog's user id with that user's username and name
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// userExtractor answers 401 when there is no valid token, so request.user is always set here
blogsRouter.post('/', userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body || {}
  const user = request.user

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

  // answer with the creator's username and name, the same shape as GET /api/blogs
  await savedBlog.populate('user', { username: 1, name: 1 })
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user

  // an invalid id makes this throw a CastError -> 400
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).end()
  }

  // blog.user is an ObjectId, not a string, so both sides are turned into strings
  if (!blog.user || blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'only the creator can delete a blog' })
  }

  await blog.deleteOne()
  user.blogs = user.blogs.filter((blogId) => blogId.toString() !== blog._id.toString())
  await user.save()

  response.status(204).end()
})

// anyone may update a blog, e.g. to like it
// the creator (user) cannot be changed here, even if the request sends one
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

  // answer with the creator's username and name, the same shape as GET /api/blogs,
  // so the frontend still knows who added the blog after a like
  await updatedBlog.populate('user', { username: 1, name: 1 })
  response.json(updatedBlog)
})

module.exports = blogsRouter
