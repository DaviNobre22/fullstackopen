const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body || {}

  // the password is checked here, not in the schema: the database only ever sees its hash
  if (!password || password.length < 3) {
    return response.status(400).json({
      error: 'password must be at least 3 characters long',
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  // a missing or too short username, or a taken one, makes save() throw -> 400
  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

module.exports = usersRouter
