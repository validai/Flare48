import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://flare48-j45i.onrender.com',
  withCredentials: true,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Circuit breaker state
let isCircuitOpen = false;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 10000; // 10 seconds
const CIRCUIT_RESET_TIMEOUT = 30000; // 30 seconds

// Track failed attempts to prevent excessive retries
let failedAttempts = 0;
const MAX_FAILED_ATTEMPTS = 3;
const RETRY_RESET_TIMEOUT = 60000; // 1 minute

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    // Reset failed attempts and circuit breaker on successful response
    failedAttempts = 0;
    isCircuitOpen = false;
    return response;
  },
  error => {
    // Only log errors that aren't due to rate limiting or expected auth issues
    if (!error.response?.status || (error.response.status !== 429 && error.response.status !== 401 && error.response.status !== 403)) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);

// Get user from session storage
const getUserData = () => {
  try {
    const userData = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    
    if (!userData || !token) {
      return { user: null, token: null };
    }

    const parsedUser = JSON.parse(userData);
    if (!parsedUser?._id) {
      console.error("Invalid user data in session storage");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      return { user: null, token: null };
    }

    return { user: parsedUser, token };
  } catch (error) {
    console.error("Error parsing user data:", error);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    return { user: null, token: null };
  }
};

const SavedArticles = () => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get user data using the new function
  const { user, token } = getUserData();

  const fetchSavedArticles = useCallback(async () => {
    try {
      if (!user?._id || !token) {
        navigate("/");
        return;
      }

      const response = await api.get(`/auth/saved-articles/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout
      });

      if (response?.data?.savedArticles) {
        setSavedArticles(response.data.savedArticles);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, token, navigate]);

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }

    // Initial fetch
    fetchSavedArticles();

    // Set up periodic refresh
    const refreshInterval = setInterval(fetchSavedArticles, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [user, token, navigate, fetchSavedArticles]);

  const handleRemoveArticle = async (article) => {
    try {
      await api.post("/auth/removeArticle", {
        userId: user._id,
        articleUrl: article.url
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout
      });

      setSavedArticles(current => 
        current.filter(savedArticle => savedArticle.url !== article.url)
      );
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  // If not authenticated, show message and redirect
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view your saved articles.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading saved articles...</h2>
          <p className="text-gray-600">Please wait while we fetch your saved articles.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 w-full"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/news")}
              className="px-4 py-2 border border-black text-black rounded-lg hover:bg-gray-100 w-full"
            >
              Back to News
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 relative">
      <button
        onClick={() => navigate("/news")}
        className="absolute top-4 left-4 p-2 text-gray-700 hover:scale-110"
      >
        <ArrowLeft size={30} />
      </button>

      <h1 className="text-4xl font-bold text-center text-gray-900">Saved Articles</h1>
      <p className="mt-4 text-lg text-center text-gray-600">
        Here are the articles you've saved.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {savedArticles.length > 0 ? (
          savedArticles.map((article, index) => (
            <div
              key={index}
              className="relative block p-4 bg-white dark:bg-neutral-100 border border-neutral-700 shadow-lg rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <img
                src={article.image || "https://via.placeholder.com/300"}
                alt={article.title}
                className="w-full h-52 object-cover rounded-xl"
              />
              <h3 className="mt-4 text-lg font-semibold text-black dark:text-black">
                {article.title}
              </h3>
              <p className="mt-2 text-sm text-black dark:text-black">
                {new Date(article.publishedAt).toLocaleString()}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Read Full Article
              </a>

              <button
                onClick={() => handleRemoveArticle(article)}
                className="absolute bottom-4 right-4 p-2 text-black hover:scale-110"
              >
                <Trash2 size={25} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-lg text-gray-600">No saved articles yet.</p>
            <button
              onClick={() => navigate("/news")}
              className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Browse News
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedArticles;
