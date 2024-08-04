import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER_USER } from '../graphql/queries'; // Make sure this import matches the mutation name in queries.js
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [register, { loading, error }] = useMutation(REGISTER_USER, {
    onCompleted: () => navigate('/login'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ variables: { username, email, password } });
      alert(`Registration Done for User: ${username}`);
      console.log(`Registration Done for User: ${username}`);
    } catch (err) {
      console.error('Registration Error:', err.message);
    }
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {error && <p className="error">Error: {error.message}</p>}
    </div>
  );
};

export default Register;
