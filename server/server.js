const express = require('express');
//adding apollo server
const { ApolloServer } = require("apollo-server-express");
const path = require('path');
//add schemas and resolvers
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
//require auth middleware
const { authMiddleware } = require('./utils/auth');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

// integrate our Apollo server with the Express application as middleware
const startApolloServer = async (typeDefs, resolvers) => { await server.start(); };
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
});
