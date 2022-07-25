import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { makeExecutableSchema } from "@graphql-tools/schema";
// Create a server:
const app = express();
let persons = [
  {
    name: "Arto Hellas",
    phone: "040-123543",
    street: "Tapiolankatu 5 A",
    city: "Espoo",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431"
  },
  {
    name: "Matti Luukkainen",
    phone: "040-432342",
    street: "Malminkaari 10 A",
    city: "Helsinki",
    id: '3d599470-3436-11e9-bc57-8b80ba54c431'
  },
  {
    name: "Venla Ruuska",
    street: "Nallemäentie 22 C",
    city: "Helsinki",
    id: '3d599471-3436-11e9-bc57-8b80ba54c431'
  },
  {
    name: "John Doe",
    street: "Test Road 123",
    city: "Test City",
    id: '3d599471-3436-11e9-bc57-8b80ba54c431'
  },
]
const typeDefs = buildSchema(`
  type Person {
    name: String!
    phone: String
    street: String!
    city: String!
    id: ID!
  }
  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }
`);
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (_root, args) =>
      persons.find(p => p.name === args.name)
  }
}
// pass the resolver map as second argument
const schema = makeExecutableSchema({ typeDefs, resolvers });
// Use those to handle incoming requests:
app.use(graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');