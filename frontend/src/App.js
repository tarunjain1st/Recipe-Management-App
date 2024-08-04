import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import RecipeList from './components/RecipeList';
import AddEditRecipe from './components/AddEditRecipe';
import Login from './components/Login';
import RecipeDetails from './components/RecipeDetails';
import Register from './components/Register';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/add-recipe" element={<AddEditRecipe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/edit/:id" element={<AddEditRecipe />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
