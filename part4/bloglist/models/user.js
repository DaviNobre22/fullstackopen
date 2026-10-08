const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 3,
    // creates a unique index in MongoDB: a second user with the same username is rejected
    unique: true,
  },
  name: String,
  // only the bcrypt hash is stored, never the password itself
  passwordHash: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the hash must never be sent to anyone
    delete returnedObject.passwordHash
  },
})

module.exports = mongoose.model('User', userSchema)
