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

  const fetchSavedArticles = useCallback(async () => {
    if (!user?._id || !token) return; // Don't fetch if no user

    try {
      const response = await api.get(
        `/auth/saved-articles/${user._id}`, // Use the current user directly
        {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
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
  }, [user, token, navigate]); // Add dependencies

  // Second useEffect to handle data fetching after user is loaded
  useEffect(() => {
    if (!state.isUserLoaded) return; // Don't proceed if user isn't loaded

    // Load cached articles immediately if available
    const cachedData = localStorage.getItem('cachedArticles');
    if (cachedData) {
      try {
        const { articles: cachedArticles } = JSON.parse(cachedData);
        setState(prev => ({ ...prev, articles: cachedArticles, isLoading: false }));
      } catch (e) {
        localStorage.removeItem('cachedArticles');
      }
    }

    // Initial fetch with delay to prevent resource exhaustion
    const initialFetchTimeout = setTimeout(() => {
      fetchArticles();
      fetchSavedArticles();
    }, 1000);

    // Set up refresh intervals with longer periods
    const articlesInterval = setInterval(fetchArticles, 10 * 60 * 1000); // 10 minutes
    const savedArticlesInterval = setInterval(fetchSavedArticles, 60 * 1000); // 1 minute

    return () => {
      clearTimeout(initialFetchTimeout);
      clearInterval(articlesInterval);
      clearInterval(savedArticlesInterval);
    };
  }, [state.isUserLoaded, fetchArticles, fetchSavedArticles]); // Only run when user is loaded

  const handleSaveArticle = async (article) => {
    if (!user?._id || !token) {
      navigate("/");
      return;
    }

    try {
      console.log("Attempting to save article:", {
        userId: user._id,
        articleTitle: article.title,
        articleUrl: article.url
      });

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
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Save article response:", response.data);
      
      if (response?.data?.savedArticle) {
        setState(prev => ({
          ...prev,
          savedArticles: [...prev.savedArticles, response.data.savedArticle]
        }));
      }
    } catch (error) {
      console.error("Error saving article:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
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

