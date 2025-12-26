import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';

// Configure axios base URL from environment variable
const apiUrl = process.env.REACT_APP_API_URL || '';
if (apiUrl) {
  axios.defaults.baseURL = apiUrl;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
