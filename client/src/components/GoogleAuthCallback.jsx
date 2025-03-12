import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const username = params.get('username');
    const email = params.get('email');

    // Validate required fields
    if (!token || !userId || !username || !email) {
      console.error('Missing required authentication data');
      navigate('/?error=missing_data');
      return;
    }

    // Validate data types
    if (typeof token !== 'string' || !token.trim() ||
        typeof userId !== 'string' || !userId.trim() ||
        typeof username !== 'string' || !username.trim() ||
        typeof email !== 'string' || !email.trim()) {
      console.error('Invalid authentication data format');
      navigate('/?error=invalid_format');
      return;
    }

    try {
      // Create user object with validated data
      const userData = {
        _id: userId,
        username: username,
        email: email
      };

      // Store validated data
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));

      // Redirect to news page
      navigate('/news');
    } catch (error) {
      console.error('Failed to store authentication data:', error);
      navigate('/?error=storage_failed');
    }
  }, [navigate, location]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback; 