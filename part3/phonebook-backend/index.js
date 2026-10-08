// load the variables in .env (MONGODB_URI, PORT) before anything reads them
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

// serve the frontend's production build (index.html, JS, CSS) from the dist folder
app.use(express.static('dist'))
// parse JSON request bodies into request.body
app.use(express.json())
// :body shows the data sent in POST requests, and nothing for other methods
morgan.token('body', (request) => {
  return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

// the "tiny" format plus the body, e.g.
// POST /api/persons 200 60 - 0.489 ms {"name":"Grace Hopper","number":"555-0100"}
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  // request.body is undefined if the request had no JSON body
  const body = request.body || {}

  // the schema in models/person.js checks the name and number when saving
  // MongoDB creates the id when the person is saved
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body || {}

  Person.findById(request.params.id)
    .then(person => {
      // the person may have been deleted, e.g. in another browser
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      // save() runs the schema validators, so an invalid number is rejected here too
      return person.save().then(updatedPerson => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  const requestTime = new Date()

  Person.countDocuments({})
    .then(count => {
      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${requestTime}</p>
      `)
    })
    .catch(error => next(error))
})

// requests that match no route above
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// errors passed on with next(error) end up here
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  // an id that is not a valid MongoDB id, e.g. /api/persons/123
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  // the name or number broke a rule in the schema, e.g. a name shorter than 3 characters
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// the error handler has to be the last middleware
app.use(errorHandler)

// hosting services like Render tell the app which port to use through PORT
const PORT = process.env.PORT || 3001
// in Express 5 a failed start (e.g. port already in use) is passed to this callback
app.listen(PORT, (error) => {
  if (error) {
    throw error
  }
  console.log(`Server running on port ${PORT}`)
})
