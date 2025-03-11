import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const username = params.get('username');

    if (token && userId && username) {
      // Store user data in sessionStorage
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify({
        _id: userId,
        username: username
      }));

      // Redirect to news page
      navigate('/news');
    } else {
      // Handle error case
      console.error('Missing authentication data');
      navigate('/?error=auth_failed');
    }
  }, [navigate, location]);

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