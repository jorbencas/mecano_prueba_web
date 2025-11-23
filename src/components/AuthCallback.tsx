import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component to handle Google OAuth callback
 * Extracts token from URL and saves it
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
          // Save token
          localStorage.setItem('auth_token', token);
          
          // Redirect to home
          window.location.href = '/';
        } else {
          // No token, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Iniciando sesión...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
