require('dotenv').config({ quiet: true })

// tests use their own database, so running them never touches the real data
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

const PORT = process.env.PORT || 3003

module.exports = { MONGODB_URI, PORT }
