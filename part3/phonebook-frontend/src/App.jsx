import { useState, useEffect } from 'react'
import personService from './services/persons'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState('success')

  // fetch the initial list once, after the first render
  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  // show a message for 5 seconds; type is 'success' or 'error'
  const notify = (message, type = 'success') => {
    setNotificationMessage(message)
    setNotificationType(type)
    setTimeout(() => {
      setNotificationMessage(null)
    }, 5000)
  }

  // the backend's explanation, e.g. "Person validation failed: name: ...",
  // or axios's own message if the backend could not be reached at all
  const errorMessage = (error) => {
    return error.response?.data?.error || error.message
  }

  const addPerson = (event) => {
    event.preventDefault()

    // compare names, not objects: two different objects are never equal
    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      const message = `${newName} is already added to phonebook, replace the old number with a new one?`
      if (!window.confirm(message)) {
        return
      }

      const changedPerson = { ...existingPerson, number: newNumber }

      personService
        .update(existingPerson.id, changedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(p => p.id === existingPerson.id ? returnedPerson : p))
          setNewName('')
          setNewNumber('')
          notify(`Changed the number of ${returnedPerson.name}`)
        })
        .catch(error => {
          if (error.response && error.response.status === 404) {
            // the person was deleted from the server, e.g. in another browser
            notify(`Information of ${existingPerson.name} has already been removed from server`, 'error')
            setPersons(persons.filter(p => p.id !== existingPerson.id))
          } else {
            // e.g. a validation error: the backend explains it in error.response.data.error
            notify(errorMessage(error), 'error')
          }
        })
      return
    }

    // no id here: the backend (MongoDB) generates one
    const personObject = {
      name: newName,
      number: newNumber
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        notify(`Added ${returnedPerson.name}`)
      })
      .catch(error => {
        notify(errorMessage(error), 'error')
      })
  }

  const deletePerson = (person) => {
    if (!window.confirm(`Delete ${person.name} ?`)) {
      return
    }

    personService
      .remove(person.id)
      .then(() => {
        setPersons(persons.filter(p => p.id !== person.id))
      })
      .catch(() => {
        notify(`Information of ${person.name} has already been removed from server`, 'error')
        setPersons(persons.filter(p => p.id !== person.id))
      })
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  // case insensitive: "arto" also matches "Arto Hellas"
  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notificationMessage} type={notificationType} />

      <Filter value={filter} onChange={handleFilterChange} />

      <h3>Add a new</h3>

      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        onNameChange={handleNameChange}
        newNumber={newNumber}
        onNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>

      <Persons persons={personsToShow} onDelete={deletePerson} />
    </div>
  )
}

export default App
