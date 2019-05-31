typetree
======

Object validation using a definition laid out as a type-tree.

## Install
```
npm install typetree
```

## Usage
```js
const {validateObject} = require('typetree')
```

### Defining a typetree
Typetree definitions can be JavaScript built-in objects
```js
Boolean
Number
String
Object
```
or a literal values such as
**null**, **"string literal"**, **12** (number), **undefined** (indicates that the values can be ommited)


Here's a comprehesive sample (validation object for a company):
```js
var validObject = {
    id: Number,
    name: String,
    address: {
        city: String,
        // optional values
        country: ['EE', 'FI', 'SE']
    },
    // an array of objects
    branches: [
        {
            name: String,
            subId: Number
        }
    ],
    // either true, false or can be ommited
    active: [Boolean, undefined]
    // strict value
    type: 'SME'
}
```

### Examples

#### Validating an object
```js
validateObject(validObject, {
    id: 10,
    name: 'John Wick',
    email: 'john.wick@example.com'
})

// result: undefined

validateObject(validObject, {
    id: 10,
    name: null,
})

// result: [
//    'expected String at name',
//    'expected String at email'
// ]
```

#### Validating optional values
```js
var validObject = {
    patient: {
        bloodType: ['A', 'B', 'AB', 'O']
    }
}

validateObject(validObject, {
    patient: {
        bloodType: 'A'
    }
})

// result: undefined

validateObject(validObject, {
    patient: {
        bloodType: 'Z'
    }
})

// result: [ 'expected any from [A, B, AB, O] at patient.bloodType' ]
```

#### Validating array contents
Provide an array with a single element in order to define an array validation object
```js
var validObject = {
    characters: [{filmId: Number, name: String}]
}

validateObject(validObject, { characters: [
    {
        filmId: 10,
        name: 'John Wick'
    },
    {
        filmId: 10
    }
]})

// result: [ 'expected String at characters[1].name' ]
```
In order to validate array contents with optionals, provide an array within an array
```js
var validObject = {
    characters: [[
        {filmId: Number, name: String},
        {deleted: true}
    ]]
}

validateObject(validObject, {
    characters: [
        {
            filmId: 10,
            name: 'John Wick'
        },
        {
            filmId: 10,
            deleted: true
        }
    ]
})

// result: undefined

validateObject(validObject, {
    characters: [
        {
            filmId: 10,
            name: 'John Wick'
        },
        {
            filmId: 10
        }
    ]
})

// result: [ 'expected any from [Object {filmId<Number>, name<String>}, Object {deleted: true}] at characters[1]' ]
```

## Test
```
node test
```

## Licence

MIT
