const Person = (props) => {
  return <p>{props.person.name} {props.person.number}</p>
}

const Persons = (props) => {
  return (
    <div>
      {props.persons.map(person =>
        <Person key={person.id} person={person} />
      )}
    </div>
  )
}

export default Persons
