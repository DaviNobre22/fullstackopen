const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

// in Express 5 a failed start (e.g. port already in use) is passed to this callback
app.listen(config.PORT, (error) => {
  if (error) {
    throw error
  }
  logger.info(`Server running on port ${config.PORT}`)
})
