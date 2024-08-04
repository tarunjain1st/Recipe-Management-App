import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { GET_RECIPES } from '../graphql/queries';
import '../styles/RecipeList.css';

const RecipeList = () => {
  const { data, loading, error } = useQuery(GET_RECIPES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      const uniqueCategories = [...new Set(data.getRecipes.map(recipe => recipe.category))];
      setCategories(uniqueCategories);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredRecipes = data.getRecipes.filter(recipe => {
    return (
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter ? recipe.category === categoryFilter : true)
    );
  });

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <div className="recipe-list-actions">
          <Link to={`/recipe/${params.row.id}`} className="recipe-list-button view-button">View</Link>
          <Link to={`/edit/${params.row.id}`} className="recipe-list-button edit-button">Edit</Link>
          <button className="recipe-list-button delete-button">Delete</button>
        </div>
      ),
    },
  ];

  const rows = filteredRecipes.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    category: recipe.category,
  }));

  return (
    <div className="recipe-list-container">
      <div className="recipe-list-navbar">
        <div className="recipe-list-navbar-title">Recipe Manager</div>
        <div className="recipe-list-navbar-buttons">
          <button className="recipe-list-nav-button" onClick={() => navigate('/dashboard')}>Back to List</button>
        </div>
      </div>
      <h2 className="recipe-list-page-title">Recipe List</h2>
      <div className="recipe-list-filter-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="recipe-list-filter-input"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="recipe-list-filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="recipe-list-details-box">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          autoHeight
        />
      </div>
    </div>
  );
};

export default RecipeList;
