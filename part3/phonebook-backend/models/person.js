const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

// the connection string (with the password) comes from the .env file, never from the code
const url = process.env.MONGODB_URI

console.log('connecting to MongoDB')
mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      // two or three digits, a dash, then more digits: 09-1234556, 040-22334455
      validator: (value) => /^\d{2,3}-\d+$/.test(value),
      message: (props) => `${props.value} is not a valid phone number`,
    },
  },
})

// send "id" as a string to the frontend, and hide MongoDB's internal _id and __v fields
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
