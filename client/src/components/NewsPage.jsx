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
    error: null
  });
  const navigate = useNavigate();
  
  // Get user data with strict validation
  const { user, token } = getUserData();
  
  // Immediately redirect if no valid user data
  useEffect(() => {
    if (!user?._id || !token) {
      navigate("/");
    }
  }, [user, token, navigate]);

  const fetchSavedArticles = useCallback(async () => {
    // Double check user data before making request
    const { user: currentUser, token: currentToken } = getUserData();
    if (!currentUser?._id || !currentToken) {
      navigate("/");
      return;
    }

    try {
      const response = await api.get(
        `/auth/saved-articles/${currentUser._id}`,
        {
          headers: { 
            'Authorization': `Bearer ${currentToken}`,
            'Cache-Control': 'no-cache'
          },
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
  }, [navigate]);

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }

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
  }, [user, token, navigate, fetchArticles, fetchSavedArticles]);

  const handleSaveArticle = async (article) => {
    if (!user?._id || !token) {
      navigate("/");
      return;
    }

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
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
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
      // Silently handle other errors to prevent UI disruption
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

