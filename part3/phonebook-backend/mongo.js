const mongoose = require('mongoose')

// usage:
//   node mongo.js <password>                  lists all entries
//   node mongo.js <password> <name> <number>  adds an entry
if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log('usage: node mongo.js <password> [<name> <number>]')
  process.exit(1)
}

const password = process.argv[2]

// copy this from Atlas (Connect > Drivers) and keep ${password} in place of the password,
// so the password itself is never written in this file
const url = `mongodb+srv://USERNAME:${encodeURIComponent(password)}@CLUSTER_ADDRESS/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

// the model Person is stored in the collection "people"
const Person = mongoose.model('Person', personSchema)

mongoose
  .connect(url)
  .then(() => {
    if (process.argv.length === 3) {
      return Person.find({}).then(persons => {
        console.log('phonebook:')
        persons.forEach(person => {
          console.log(`${person.name} ${person.number}`)
        })
      })
    }

    const person = new Person({
      name: process.argv[3],
      number: process.argv[4],
    })

    return person.save().then(() => {
      console.log(`added ${person.name} number ${person.number} to phonebook`)
    })
  })
  .catch(error => {
    console.log('error:', error.message)
  })
  // close only after the work above has finished (or failed)
  .finally(() => {
    mongoose.connection.close()
  })
