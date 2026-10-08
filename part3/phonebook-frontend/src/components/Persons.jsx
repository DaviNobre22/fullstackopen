const Person = (props) => {
  return (
    <p>
      {props.person.name} {props.person.number}{' '}
      <button onClick={props.onDelete}>delete</button>
    </p>
  )
}

const Persons = (props) => {
  return (
    <div>
      {props.persons.map(person =>
        <Person
          key={person.id}
          person={person}
          onDelete={() => props.onDelete(person)}
        />
      )}
    </div>
  )
}

export default Persons
