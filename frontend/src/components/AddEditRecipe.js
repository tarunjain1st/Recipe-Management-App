// src/components/AddEditRecipe.js

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_RECIPE } from "../graphql/queries";
import { ADD_RECIPE, UPDATE_RECIPE } from "../graphql/queries";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/AddEditRecipe.css";

const AddEditRecipe = () => {
  const { id } = useParams(); // Get recipe ID from URL params
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { data, loading } = useQuery(GET_RECIPE, {
    variables: { id },
    skip: !id,
    onCompleted: (data) => {
      if (data) {
        const { title, ingredients, instructions, category, date } =
          data.getRecipe;
        setTitle(title);
        setIngredients(ingredients);
        setInstructions(instructions);
        setCategory(category);
        setDate(date);
      }
    },
  });

  const [addRecipe] = useMutation(ADD_RECIPE);
  const [updateRecipe] = useMutation(UPDATE_RECIPE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateRecipe({
          variables: { id, title, ingredients, instructions, category, date },
        });
      } else {
        await addRecipe({
          variables: { title, ingredients, instructions, category, date },
        });
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving recipe:", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="add-edit-recipe">
      <div className="navbar">
        <div className="navbar-title">Recipe Manager</div>
        <div className="navbar-buttons">
          <button className="nav-button" onClick={() => navigate("/dashboard")}>
            Back to List
          </button>
        </div>
      </div>
      <h2 className="page-title">Add/Edit Recipe</h2>
      <div className="add-edit-recipe-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Ingredients:</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Instructions:</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-button">
              {id ? "Update Recipe" : "Add Recipe"}
            </button>
            <button type="button" className="cancel-button" onClick={() => navigate("/dashboard")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditRecipe;
