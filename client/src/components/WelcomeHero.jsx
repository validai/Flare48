import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

const WelcomeHero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const images = [
    "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bmV3cyUyMGFydGljbGVzfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bmV3c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = {
      email: e.target.email.value.trim(),
      password: e.target.password.value.trim()
    };

    try {
      // Validate input
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const endpoint = isSignup ? '/auth/register' : '/auth/login';
      
      console.log('Auth Request:', {
        url: api.defaults.baseURL + endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: { 
          email: formData.email,
          password: '[REDACTED]'
        }
      });
      
      const response = await api.post(endpoint, formData);
      console.log('Auth Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: {
          ...response.data,
          user: response.data?.user ? {
            _id: response.data.user._id,
            email: response.data.user.email
          } : null,
          token: response.data?.token ? '[PRESENT]' : '[MISSING]'
        }
      });

      // Check if response has the expected format
      if (!response.data) {
        console.error('Empty response data');
        throw new Error('Invalid response format from server');
      }

      // For registration
      if (isSignup) {
        if (!response.data.user?._id || !response.data.token) {
          console.error('Invalid registration response format:', {
            hasUser: !!response.data.user,
            hasUserId: !!response.data.user?._id,
            hasToken: !!response.data.token
          });
          throw new Error('Registration failed: Invalid response format');
        }
        console.log('Registration successful, storing user data');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      } else {
        // For login
        if (!response.data?.user?._id || !response.data?.token) {
          console.error('Invalid login response format:', {
            hasUser: !!response.data.user,
            hasUserId: !!response.data.user?._id,
            hasToken: !!response.data.token
          });
          throw new Error('Login failed: Invalid credentials or server error');
        }
        console.log('Login successful, storing user data');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }

      // Verify stored data
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      console.log('Stored data verification:', {
        hasStoredUser: !!storedUser,
        hasStoredToken: !!storedToken,
        parsedUser: storedUser ? JSON.parse(storedUser) : null
      });
      
      // Close modal and navigate to news
      setIsModalOpen(false);
      navigate('/news');
    } catch (error) {
      console.error('Auth error:', {
        name: error.name,
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null,
        request: error.request ? '[REQUEST_OBJECT_PRESENT]' : null
      });
      
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.error || 
                      error.response.data?.message ||
                      `Server error: ${error.response.status} - ${error.response.statusText}`;
        console.error('Server error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection and try again.';
        console.error('Network error details:', {
          request: '[REQUEST_OBJECT_PRESENT]',
          message: error.message
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Failed to process request';
        console.error('Request setup error:', error.message);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={images[currentImageIndex]}
          alt="News background"
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Stay Informed with Flare48
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Your source for the latest news and updates from around the world of only the past 48 hours.
          Get real-time coverage of breaking stories.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setIsSignup(true);
              setIsModalOpen(true);
            }}
            className="px-8 py-3 bg-white text-black rounded-lg text-lg font-semibold hover:bg-neutral-200 transition"
          >
            Get Started
          </button>
          <button
            onClick={() => {
              setIsSignup(false);
              setIsModalOpen(true);
            }}
            className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white/10 transition"
          >
            Login
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-black mb-6">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Login')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-black hover:underline"
                >
                  {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default WelcomeHero;

