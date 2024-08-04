import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RECIPES } from '../graphql/queries';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { loading, error, data, refetch } = useQuery(GET_RECIPES);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Refetch data when the component mounts or when refetch function is available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token == null){
    navigate('/login');
    }
    if (refetch) {
      refetch();
    }
  }, [refetch]);

  // Use the refetch function after operations like add, update, delete
  const handleRefetch = async () => {
    await refetch();
  };

  const recipes = data ? data.getRecipes : [];
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const categories = recipes.length ? [...new Set(recipes.map(recipe => recipe.category))] : [];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching recipes: {error.message}</p>;

  return (
    <div className="dashboard">
      <div className="navbar">
        <h1 className="navbar-title">Recipe Manager</h1>
        <div className="navbar-buttons">
          <Link to="/add-recipe" className="nav-button">Add New Recipe</Link>
          <Link to="/recipes" className="nav-button">Recipe List</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <h2 className="page-title">Recipe Dashboard</h2>
      <div className="info-container">
        <div className="info-item">
          <div className="info-label">Total Recipes:</div>
          <div className="info-details">{recipes.length}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Categories:</div>
          <div className="info-details">
            {categories.map((category, index) => (
              <span key={index} className="category-box">{category}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="recipe-list">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="recipe-link">
              {recipe.title}
            </Link>
          ))
        ) : (
          <p>No recipes found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
