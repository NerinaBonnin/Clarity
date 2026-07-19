import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const app = (
  <AuthProvider>
    <App />
  </AuthProvider>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {googleClientId
      ? <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
      : app}
  </React.StrictMode>
);
