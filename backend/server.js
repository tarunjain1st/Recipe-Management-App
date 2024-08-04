require('dotenv').config(); // Load environment variables from .env file

const { ApolloServer, gql, AuthenticationError } = require('apollo-server-express');
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');

// File paths for local JSON database
const usersFilePath = path.join(__dirname, 'data', 'users.json');
const recipesFilePath = path.join(__dirname, 'data', 'recipes.json');

// Load initial data from JSON files
const loadData = (filePath) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }
  return [];
};

let users = loadData(usersFilePath);
let recipes = loadData(recipesFilePath);

// Define schema
const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    username: String!
  }

  type Recipe {
    id: ID!
    title: String!
    ingredients: String!
    instructions: String!
    category: String!
    date: String!
  }

  type AuthPayload {
    token: String
    refreshToken: String
  }

  type Query {
    getRecipes: [Recipe]
    getRecipe(id: ID!): Recipe
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User
    login(username: String!, password: String!): AuthPayload
    addRecipe(title: String!, ingredients: String!, instructions: String!, category: String!, date: String!): Recipe
    deleteRecipe(id: ID!): Boolean
    updateRecipe(id: ID!, title: String!, ingredients: String!, instructions: String!, category: String!, date: String!): Recipe
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    getRecipes: (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      return recipes.filter(recipe => recipe.userId === context.user.id);
    },
    getRecipe: (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      return recipes.find(recipe => recipe.id === args.id && recipe.userId === context.user.id);
    },
  },
  Mutation: {
    register: async (parent, args) => {
      const { username, email, password } = args;
      if (users.find(user => user.username === username)) {
        throw new Error('Username already exists');
      }
      if (users.find(user => user.email === email)) {
        throw new Error('Email already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { id: `${users.length + 1}`, username, email, password: hashedPassword };
      users.push(newUser);
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      return newUser;
    },
    login: (parent, args) => {
      const { username, password } = args;
      const user = users.find(user => user.username === username);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error('Invalid credentials');
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return { token, refreshToken };
    },
    addRecipe: (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      const newRecipe = { id: `${recipes.length + 1}`, ...args, userId: context.user.id };
      recipes.push(newRecipe);
      fs.writeFileSync(recipesFilePath, JSON.stringify(recipes, null, 2));
      return newRecipe;
    },
    deleteRecipe: (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      const index = recipes.findIndex(recipe => recipe.id === args.id && recipe.userId === context.user.id);
      if (index === -1) {
        throw new Error('Recipe not found or not authorized');
      }
      recipes.splice(index, 1);
      fs.writeFileSync(recipesFilePath, JSON.stringify(recipes, null, 2));
      return true;
    },
    updateRecipe: (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      const index = recipes.findIndex(recipe => recipe.id === args.id && recipe.userId === context.user.id);
      if (index === -1) {
        throw new Error('Recipe not found or not authorized');
      }
      const updatedRecipe = { ...recipes[index], ...args };
      recipes[index] = updatedRecipe;
      fs.writeFileSync(recipesFilePath, JSON.stringify(recipes, null, 2));
      return updatedRecipe;
    },
  },
};

// Initialize server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    if (token) {
      try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        const user = users.find(user => user.id === decoded.userId);
        if (!user) {
          throw new AuthenticationError('User not found');
        }
        return { user };
      } catch (err) {
        throw new AuthenticationError('Invalid token');
      }
    }
    return {}; // No user context if no token
  },
});

const app = express();
app.use(cors()); // Add CORS configuration
app.use(bodyParser.json());

app.post('/refresh_token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.sendStatus(401);
  }

  let payload = null;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.sendStatus(401);
  }

  const user = users.find(user => user.id === payload.userId);
  if (!user) {
    return res.sendStatus(401);
  }

  const newToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return res.json({ accessToken: newToken });
});

server.start().then(() => {
  server.applyMiddleware({ app });
  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
});
