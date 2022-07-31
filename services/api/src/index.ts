import dotenv from 'dotenv';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { makeExecutableSchema } from "@graphql-tools/schema";
import { getBlogs } from './queries/blogs';
import { DateTimeTypeDefinition } from "graphql-scalars"

dotenv.config();
let blogs;

const main = async () => {

  blogs = await getBlogs();

  const typeDefs = await buildSchema(`
    scalar DateTime,

    type Blog {
      id: ID!
      title: String!
      author: String!
      publishDate: DateTime!
      imageUrl: String!
      guidUrl: String!
      tags: [String!]!
    }
    type Query {
      blogCount: Int!
      allBlogs: [Blog!]!
      findBlog(id: ID!): Blog
    }
  `);
  const resolvers = {
    Query: {
      blogCount: () => blogs.length,
      allBlogs: () => blogs,
      findBlog: (_root, args) => 
        blogs.find(b => b.id === args.id) 
    }
  }
  // pass the resolver map as second argument
  const schema = await makeExecutableSchema({ 
    typeDefs: [
      DateTimeTypeDefinition,
      typeDefs,
    ], 
    resolvers,
  });

  // Create a server:
  const app = express();

  // Use those to handle incoming requests:
  app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
  }));
  app.listen(4000);

  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
};

main().catch((error) => {
  console.log(error, 'error');
});
