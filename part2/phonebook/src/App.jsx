import { useState, useEffect } from 'react'
import personService from './services/persons'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  // fetch the initial list once, after the first render
  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

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
        })
      return
    }

    // no id here: json-server generates one
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
