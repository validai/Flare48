import React, { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://flare48-j45i.onrender.com',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Enhanced user data validation
const getUserData = () => {
  try {
    const userData = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    
    if (!userData || !token) {
      return { user: null, token: null };
    }

    const parsedUser = JSON.parse(userData);
    
    // Strict validation of user data
    if (!parsedUser || typeof parsedUser !== 'object' || !parsedUser._id) {
      console.error("Invalid or incomplete user data:", parsedUser);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      return { user: null, token: null };
    }

    // Validate token format (should be a non-empty string)
    if (typeof token !== 'string' || !token.trim()) {
      console.error("Invalid token format");
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
    error: null,
    isUserLoaded: false
  });
  const navigate = useNavigate();
  
  // Get user data with strict validation
  const { user, token } = getUserData();
  
  // First useEffect to handle user authentication
  useEffect(() => {
    if (!user?._id || !token) {
      navigate("/");
      return;
    }
    // If we have valid user data, mark it as loaded
    setState(prev => ({ ...prev, isUserLoaded: true }));
  }, [user, token, navigate]);

  // Add the fetchArticles function
  const fetchArticles = useCallback(async () => {
    if (!user?._id || !token) return; // Don't fetch if no user

    try {
      const apiKey = "01008499182045707c100247f657ba5c";
      const currentDate = new Date();
      const pastDate = new Date(currentDate.getTime() - 48 * 60 * 60 * 1000);
      const formattedDate = pastDate.toISOString();

      const response = await axios.get(
        `https://gnews.io/api/v4/search?q=latest&from=${formattedDate}&sortby=publishedAt&token=${apiKey}&lang=en`
      );

      if (response?.data?.articles) {
        localStorage.setItem('cachedArticles', JSON.stringify({
          articles: response.data.articles,
          timestamp: Date.now()
        }));

        setState(prev => ({ 
          ...prev, 
          articles: response.data.articles,
          isLoading: false 
        }));
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      
      const cachedData = localStorage.getItem('cachedArticles');
      if (cachedData) {
        try {
          const { articles: cachedArticles } = JSON.parse(cachedData);
          setState(prev => ({ 
            ...prev, 
            articles: cachedArticles,
            isLoading: false 
          }));
        } catch (e) {
          setState(prev => ({ 
            ...prev, 
            error: "Failed to load articles. Please try again later.",
            isLoading: false 
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          error: "Failed to load articles. Please try again later.",
          isLoading: false 
        }));
      }
    }
  }, [user, token]); // Add dependencies

  const fetchSavedArticles = useCallback(async (retryCount = 0) => {
    if (!user?._id || !token) return; // Don't fetch if no user

    try {
      console.log("Fetching saved articles for user:", user._id);
      const response = await api.get(
        `/auth/saved-articles/${user._id}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("Saved articles response:", response.data);

      if (response?.data?.savedArticles) {
        setState(prev => ({ 
          ...prev, 
          savedArticles: response.data.savedArticles,
          isLoading: false,
          error: null
        }));
      } else {
        console.error("Invalid response format:", response.data);
        setState(prev => ({
          ...prev,
          error: "Failed to fetch saved articles: Invalid response format",
          isLoading: false
        }));
      }
    } catch (error) {
      console.error("Error fetching saved articles:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // Handle resource exhaustion with retry logic
      if (error.message?.includes('ERR_INSUFFICIENT_RESOURCES') && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Retrying fetch after ${delay}ms (attempt ${retryCount + 1}/3)`);
        
        setTimeout(() => {
          fetchSavedArticles(retryCount + 1);
        }, delay);
        
        return;
      }

      setState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Failed to fetch saved articles",
        isLoading: false
      }));

      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  }, [user, token, navigate]);

  // Second useEffect to handle data fetching after user is loaded
  useEffect(() => {
    if (!state.isUserLoaded) return; // Don't proceed if user isn't loaded

    // Load cached articles immediately if available
    const cachedData = localStorage.getItem('cachedArticles');
    if (cachedData) {
      try {
        const { articles: cachedArticles } = JSON.parse(cachedData);
        setState(prev => ({ ...prev, articles: cachedArticles }));
      } catch (e) {
        localStorage.removeItem('cachedArticles');
      }
    }

    // Initial data fetch with delay
    const fetchInitialData = async () => {
      try {
        // Add a small delay before the first fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchSavedArticles();
        await fetchArticles();
      } catch (error) {
        console.error("Error during initial data fetch:", error);
      }
    };

    fetchInitialData();

    // Set up refresh intervals with longer periods
    const articlesInterval = setInterval(fetchArticles, 10 * 60 * 1000); // 10 minutes
    const savedArticlesInterval = setInterval(fetchSavedArticles, 60 * 1000); // Increased to 60 seconds

    return () => {
      clearInterval(articlesInterval);
      clearInterval(savedArticlesInterval);
    };
  }, [state.isUserLoaded, fetchArticles, fetchSavedArticles]);

  const normalizeUrl = (url) => {
    try {
      // Remove query parameters and trailing slashes
      return url.split('?')[0].replace(/\/$/, '');
    } catch (e) {
      return url;
    }
  };

  const handleSaveArticle = async (article) => {
    if (!user?._id || !token) {
      navigate("/");
      return;
    }

    try {
      const normalizedUrl = normalizeUrl(article.url);
      
      console.log("Attempting to save article:", {
        userId: user._id,
        articleTitle: article.title,
        articleUrl: normalizedUrl
      });

      // Check if article is already saved
      const isAlreadySaved = state.savedArticles.some(
        savedArticle => normalizeUrl(savedArticle.url) === normalizedUrl
      );

      if (isAlreadySaved) {
        console.log("Article already saved:", normalizedUrl);
        return;
      }

      // Ensure all required fields are present
      if (!article.title || !article.url) {
        console.error("Missing required article fields:", article);
        setState(prev => ({
          ...prev,
          error: "Invalid article data: missing required fields"
        }));
        return;
      }

      const response = await api.post(
        "/auth/saveArticle",
        {
          userId: user._id,
          article: {
            title: article.title,
            url: normalizedUrl, // Use normalized URL
            image: article.image || null,
            publishedAt: article.publishedAt || new Date().toISOString()
          }
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Save article response:", response.data);
      
      if (response?.data?.savedArticle) {
        setState(prev => ({
          ...prev,
          savedArticles: [...prev.savedArticles, response.data.savedArticle],
          error: null
        }));
      } else {
        console.error("Invalid save response:", response.data);
        setState(prev => ({
          ...prev,
          error: "Failed to save article: Invalid response"
        }));
      }
    } catch (error) {
      console.error("Error saving article:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      setState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Failed to save article. Please try again."
      }));
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const handleRemoveArticle = async (article) => {
    try {
      console.log("Attempting to remove article:", {
        userId: user._id,
        articleUrl: article.url
      });

      const response = await api.post(
        "/auth/removeArticle",
        {
          userId: user._id,
          articleUrl: article.url
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        console.log("Article removed successfully");
        setState(prev => ({
          ...prev,
          savedArticles: prev.savedArticles.filter(
            savedArticle => normalizeUrl(savedArticle.url) !== normalizeUrl(article.url)
          ),
          error: null
        }));
      } else {
        console.error("Failed to remove article:", response.data);
        setState(prev => ({
          ...prev,
          error: "Failed to remove article. Please try again."
        }));
      }
    } catch (error) {
      console.error("Error removing article:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      setState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Failed to remove article. Please try again."
      }));

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

      {state.error && (
        <div className="mx-8 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="m-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, index) => {
          // Normalize URLs before comparison
          const normalizedArticleUrl = normalizeUrl(article.url);
          const isSaved = savedArticles.some(
            (savedArticle) => normalizeUrl(savedArticle.url) === normalizedArticleUrl
          );

          return (
            <div key={normalizedArticleUrl} className="relative flex flex-col">
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

