require('dotenv').config(); // Load environment variables from .env file

const { ApolloServer, gql, AuthenticationError } = require('apollo-server-express');
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: { type: String, required: true },
  instructions: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const User = mongoose.model('User', userSchema);
const Recipe = mongoose.model('Recipe', recipeSchema);

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
    getRecipes: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      return await Recipe.find({ userId: context.user.id });
    },
    getRecipe: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      return await Recipe.findOne({ _id: args.id, userId: context.user.id });
    },
  },
  Mutation: {
    register: async (parent, args) => {
      const { username, email, password } = args;
      if (await User.findOne({ username })) {
        throw new Error('Username already exists');
      }
      if (await User.findOne({ email })) {
        throw new Error('Email already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();
      return newUser;
    },
    login: async (parent, args) => {
      const { username, password } = args;
      const user = await User.findOne({ username });
      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error('Invalid credentials');
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return { token, refreshToken };
    },
    addRecipe: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      const newRecipe = new Recipe({ ...args, userId: context.user.id });
      await newRecipe.save();
      return newRecipe;
    },
    deleteRecipe: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      const recipe = await Recipe.findOneAndDelete({ _id: args.id, userId: context.user.id });
      if (!recipe) {
        throw new Error('Recipe not found or not authorized');
      }
      return true;
    },
    updateRecipe: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      const updatedRecipe = await Recipe.findOneAndUpdate(
        { _id: args.id, userId: context.user.id },
        { ...args },
        { new: true }
      );
      if (!updatedRecipe) {
        throw new Error('Recipe not found or not authorized');
      }
      return updatedRecipe;
    },
  },
};

// Initialize server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization || '';
    if (token) {
      try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
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

app.post('/refresh_token', async (req, res) => {
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

  const user = await User.findById(payload.userId);
  if (!user) {
    return res.sendStatus(401);
  }

  const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return res.json({ accessToken: newToken });
});

server.start().then(() => {
  server.applyMiddleware({ app });
  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
});
