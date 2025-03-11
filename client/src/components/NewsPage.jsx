import React, { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
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
    failedAttempts = 0;
    isCircuitOpen = false;
    return response;
  },
  error => {
    // Only log unexpected server errors or network issues
    if (error.code === 'ERR_NETWORK' || (error.response?.status && error.response.status >= 500)) {
      console.error('API Error:', {
        type: error.code || error.response?.status,
        url: error.config?.url?.split('?')[0] // Log URL without query params
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

const NewsPage = () => {
  const [state, setState] = useState({
    articles: [],
    savedArticles: [],
    isLoading: true,
    error: null
  });
  const navigate = useNavigate();

  // Get user data using the new function
  const { user, token } = getUserData();

  // Check server health
  const checkServerHealth = useCallback(async () => {
    // Don't check health if circuit is open
    if (isCircuitOpen) {
      return false;
    }

    // Implement rate limiting for health checks
    const now = Date.now();
    if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
      return !isCircuitOpen; // Return last known state
    }

    try {
      lastHealthCheck = now;
      const response = await api.get('/health');
      const isHealthy = response.data.status === 'healthy' && response.data.mongo === 'connected';
      
      if (!isHealthy) {
        isCircuitOpen = true;
        setTimeout(() => {
          isCircuitOpen = false;
        }, CIRCUIT_RESET_TIMEOUT);
      }
      
      return isHealthy;
    } catch (error) {
      isCircuitOpen = true;
      setTimeout(() => {
        isCircuitOpen = false;
      }, CIRCUIT_RESET_TIMEOUT);
      return false;
    }
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      // Always check cache first
      const cachedData = localStorage.getItem('cachedArticles');
      if (cachedData) {
        const { articles: cachedArticles, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        
        // Use cache if it's less than 30 minutes old
        if (cacheAge < 30 * 60 * 1000) {
          setState(prev => ({ ...prev, articles: cachedArticles, isLoading: false }));
          return;
        }
      }

      const apiKey = "01008499182045707c100247f657ba5c";
      const currentDate = new Date();
      const pastDate = new Date(currentDate.getTime() - 48 * 60 * 60 * 1000);
      const formattedDate = pastDate.toISOString();

      const response = await axios.get(
        `https://gnews.io/api/v4/search?q=latest&from=${formattedDate}&sortby=publishedAt&token=${apiKey}&lang=en`,
        { timeout: 10000 }
      );
      
      if (response?.data?.articles) {
        // Cache the new articles with timestamp
        localStorage.setItem('cachedArticles', JSON.stringify({
          articles: response.data.articles,
          timestamp: Date.now()
        }));
        
        setState(prev => ({ ...prev, articles: response.data.articles, isLoading: false }));
      }
    } catch (error) {
      // If we have cached articles, use them as fallback silently
      const cachedData = localStorage.getItem('cachedArticles');
      if (cachedData) {
        const { articles: cachedArticles } = JSON.parse(cachedData);
        setState(prev => ({ ...prev, articles: cachedArticles, isLoading: false }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  const fetchSavedArticles = useCallback(async () => {
    if (!user?._id || !token) return;

    try {
      const response = await api.get(
        `/auth/saved-articles/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );

      if (response?.data?.savedArticles) {
        setState(prev => ({ ...prev, savedArticles: response.data.savedArticles }));
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  }, [user, token, navigate]);

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }

    // Load cached articles immediately if available
    const cachedData = localStorage.getItem('cachedArticles');
    if (cachedData) {
      const { articles: cachedArticles } = JSON.parse(cachedData);
      setState(prev => ({ ...prev, articles: cachedArticles, isLoading: false }));
    }

    // Fetch fresh data
    Promise.all([
      fetchArticles(),
      fetchSavedArticles()
    ]).finally(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    });

    // Set up refresh intervals
    const articlesInterval = setInterval(fetchArticles, 5 * 60 * 1000);
    const savedArticlesInterval = setInterval(fetchSavedArticles, 30 * 1000);

    return () => {
      clearInterval(articlesInterval);
      clearInterval(savedArticlesInterval);
    };
  }, [user, token, navigate, fetchArticles, fetchSavedArticles]);

  const handleSaveArticle = async (article) => {
    try {
      const response = await api.post(
        "/auth/saveArticle",
        {
          userId: user._id,
          article: {
            title: article.title,
            url: article.url,
            image: article.image,
            publishedAt: article.publishedAt,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      
      if (response?.data?.savedArticle) {
        setState(prev => ({
          ...prev,
          savedArticles: [...prev.savedArticles, response.data.savedArticle]
        }));
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const handleRemoveArticle = async (article) => {
    try {
      await api.post(
        "/auth/removeArticle",
        {
          userId: user._id,
          articleUrl: article.url
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );

      setState(prev => ({
        ...prev,
        savedArticles: prev.savedArticles.filter(savedArticle => savedArticle.url !== article.url)
      }));
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view the news.</p>
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

  const { articles, savedArticles, isLoading, error } = state;

  if (isLoading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading news...</h2>
          <p className="text-gray-600">Please wait while we fetch the latest articles.</p>
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
          <button
            onClick={() => fetchArticles()}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-900">Latest News</h1>

      <div className="m-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, index) => {
          const isSaved = savedArticles.some(
            (savedArticle) => savedArticle.url === article.url
          );

          return (
            <div key={index} className="relative flex flex-col">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-white dark:bg-neutral-100 border border-neutral-700 shadow-lg rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col h-full"
              >
                <img
                  src={article.image || "https://via.placeholder.com/300"}
                  alt={article.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="flex flex-col flex-grow">
                  <h3 className="mt-4 text-lg font-semibold text-black dark:text-black line-clamp-3">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm text-black dark:text-black">
                    {new Date(article.publishedAt).toLocaleString()}
                  </p>
                </div>
              </a>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  isSaved ? handleRemoveArticle(article) : handleSaveArticle(article);
                }}
                className={`absolute bottom-4 right-4 p-2 transition-colors duration-300 hover:scale-110 ease-in-out 
                  ${isSaved ? "text-red-500" : "text-black"}`}
              >
                <Heart size={25} className={isSaved ? "fill-red-500" : ""} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsPage;

