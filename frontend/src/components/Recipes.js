// src/components/Recipes.js

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_RECIPES, DELETE_RECIPE } from "../graphql/queries";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../styles/Recipes.css";

const Recipes = () => {
  const { data, loading, error, refetch } = useQuery(GET_RECIPES);
  const [deleteRecipe] = useMutation(DELETE_RECIPE);
  const navigate = useNavigate(); // Hook for navigation

  const handleDelete = async (id) => {
    try {
      await deleteRecipe({ variables: { id } });
      refetch();
    } catch (err) {
      console.error("Failed to delete recipe", err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`); // Navigate to the Edit page with the recipe ID
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching recipes: {error.message}</p>;

  return (
    <div>
      <Header />
      <div className="recipes-container">
        <h2>Your Recipes</h2>
        {data.getRecipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <h3>{recipe.title}</h3>
            <p>
              <strong>Ingredients:</strong> {recipe.ingredients}
            </p>
            <p>
              <strong>Instructions:</strong> {recipe.instructions}
            </p>
            <p>
              <strong>Category:</strong> {recipe.category}
            </p>
            <button onClick={() => handleDelete(recipe.id)}>Delete</button>
            <button onClick={() => handleEdit(recipe.id)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
