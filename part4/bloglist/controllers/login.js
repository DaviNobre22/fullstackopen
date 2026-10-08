const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body || {}

  const user = await User.findOne({ username })
  const passwordCorrect = user === null || !password
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  // the same answer for a wrong username and a wrong password,
  // so nobody can find out which usernames exist
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password',
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // the token is signed with SECRET, so it cannot be faked; it expires after one hour
  const token = jwt.sign(userForToken, config.SECRET, { expiresIn: 60 * 60 })

  response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
