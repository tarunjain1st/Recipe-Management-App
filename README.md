# Recipe Management Application - Indium Traning Project

Welcome to the Recipe Management Application! This is a full-stack web application that allows users to manage their personal recipes. Users can add, edit, delete, and categorize their recipes. The application includes user authentication for secure access to personal recipe data.

## Features

- **User Authentication:** Secure login and registration using usernames.
- **Recipe Management:** Add, edit, view, and delete recipes.
- **Recipe Categorization:** Organize recipes into different categories.
- **Search and Filter:** Search recipes by title and filter by category.
- **Responsive Design:** User-friendly design that works on both desktop and mobile devices.

## Technologies Used

- **Frontend:**
  - React JS
  - Apollo Client
  - React Router
  - Material-UI (MUI) for styling and DataGrid components

- **Backend:**
  - Node.js
  - Express.js
  - Apollo Server
  - GraphQL
  - MongoDB Atlas (as a cloud database)

- **Deployment:**
  - Vercel for both frontend and backend


## Setup Instructions

### Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/recipe-management-app.git
   cd recipe-management-app/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file in the backend directory and add your MongoDB connection string:
   ```makefile
   MONGODB_URI=your_mongodb_connection_string
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   
### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file in the frontend directory and add the backend URL:
   ```bash
   REACT_APP_API_URL=http://localhost:4000/graphql
   ```
4. Start the frontend development server:
   ```bash
   npm start
   ```

## Deployment

### Backend
1. Push your code to GitHub.
2. Create a new project on Vercel and import your GitHub repository.
3. Set up environment variables on Vercel:
   * MONGODB_URI: your MongoDB connection string
4. Deploy the backend.

### Frontend
1. Push your code to GitHub.
2. Create a new project on Vercel and import your GitHub repository.
3. Set up environment variables on Vercel:
   * REACT_APP_API_URL: the deployed backend URL
4. Deploy the frontend.
