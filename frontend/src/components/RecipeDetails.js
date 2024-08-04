import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RECIPE, DELETE_RECIPE } from '../graphql/queries';
import '../styles/RecipeDetails.css';

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_RECIPE, {
    variables: { id },
  });

  const [deleteRecipe] = useMutation(DELETE_RECIPE, {
    onCompleted: () => navigate('/dashboard'),
    onError: (err) => console.error('Delete error', err),
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { title, category, ingredients, instructions, date } = data.getRecipe;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipe({ variables: { id } });
    }
  };

  const renderList = (items) => (
    <ol className="recipe-details-list">
      {items.split('\n').map((item, index) => (
        <li key={index} className="recipe-details-list-item">
          {item.trim()}
        </li>
      ))}
    </ol>
  );

  return (
    <div className="recipe-details-container">
      <div className="recipe-details-navbar">
        <div className="recipe-details-navbar-title">Recipe Manager</div>
        <div className="recipe-details-navbar-buttons">
          <Link to="/dashboard" className="recipe-details-nav-button">Back to List</Link>
        </div>
      </div>
      <h2 className="recipe-details-page-title">Recipe Details</h2>
      <div className="recipe-details-box">
        <div className="recipe-details-row">
          <div className="recipe-details-label">Title:</div>
          <div className="recipe-details-value">{title}</div>
        </div>
        <div className="recipe-details-row">
          <div className="recipe-details-label">Category:</div>
          <div className="recipe-details-value">{category}</div>
        </div>
        <div className="recipe-details-row">
          <div className="recipe-details-label">Ingredients:</div>
          <div className="recipe-details-value">{renderList(ingredients)}</div>
        </div>
        <div className="recipe-details-row">
          <div className="recipe-details-label">Instructions:</div>
          <div className="recipe-details-value">{renderList(instructions)}</div>
        </div>
        <div className="recipe-details-row">
          <div className="recipe-details-label">Date Added:</div>
          <div className="recipe-details-value">{new Date(date).toLocaleDateString()}</div>
        </div>
        <div className="recipe-details-actions">
          <button className="recipe-details-action-button edit-button" onClick={() => navigate(`/edit/${id}`)}>Edit</button>
          <button className="recipe-details-action-button delete-button" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
