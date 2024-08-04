import { gql } from '@apollo/client';

// Query to get all recipes
export const GET_RECIPES = gql`
  query GetRecipes {
    getRecipes {
      id
      title
      ingredients
      instructions
      category
      date
    }
  }
`;

// Query to get a single recipe by ID
export const GET_RECIPE = gql`
  query GetRecipe($id: ID!) {
    getRecipe(id: $id) {
      id
      title
      ingredients
      instructions
      category
      date
    }
  }
`;

// Mutation to add a new recipe
export const ADD_RECIPE = gql`
  mutation AddRecipe($title: String!, $ingredients: String!, $instructions: String!, $category: String!, $date: String!) {
    addRecipe(title: $title, ingredients: $ingredients, instructions: $instructions, category: $category, date: $date) {
      id
      title
      ingredients
      instructions
      category
      date
    }
  }
`;

// Mutation to update an existing recipe
export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($id: ID!, $title: String!, $ingredients: String!, $instructions: String!, $category: String!, $date: String!) {
    updateRecipe(id: $id, title: $title, ingredients: $ingredients, instructions: $instructions, category: $category, date: $date) {
      id
      title
      ingredients
      instructions
      category
      date
    }
  }
`;

// Mutation to delete a recipe
export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;

// Mutation for user registration
export const REGISTER_USER = gql`
  mutation RegisterUser($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      id
      username
      email
    }
  }
`;

// Mutation for user login
export const LOGIN_USER = gql`
  mutation LoginUser($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;
