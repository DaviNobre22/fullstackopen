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

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122'
  }
]

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

// random id between 0 and 999 999 999, so duplicates are very unlikely
const generateId = () => {
  return String(Math.floor(Math.random() * 1000000000))
}

app.post('/api/persons', (request, response) => {
  // request.body is undefined if the request had no JSON body
  const body = request.body || {}

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('/info', (request, response) => {
  const requestTime = new Date()

  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${requestTime}</p>
  `)
})

// hosting services like Render tell the app which port to use through PORT
const PORT = process.env.PORT || 3001
// in Express 5 a failed start (e.g. port already in use) is passed to this callback
app.listen(PORT, (error) => {
  if (error) {
    throw error
  }
  console.log(`Server running on port ${PORT}`)
})
