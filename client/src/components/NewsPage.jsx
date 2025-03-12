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
    isLoadingArticles: true,
    isLoadingSaved: true,
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
          isLoadingArticles: false 
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
            isLoadingArticles: false 
          }));
        } catch (e) {
          setState(prev => ({ 
            ...prev, 
            error: "Failed to load articles. Please try again later.",
            isLoadingArticles: false 
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          error: "Failed to load articles. Please try again later.",
          isLoadingArticles: false 
        }));
      }
    }
  }, [user, token]);

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
          isLoadingSaved: false,
          error: null
        }));
      } else {
        console.error("Invalid response format:", response.data);
        setState(prev => ({
          ...prev,
          error: "Failed to fetch saved articles: Invalid response format",
          isLoadingSaved: false
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
        isLoadingSaved: false
      }));

      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  }, [user, token, navigate]);

  // Load cached articles immediately if available
  useEffect(() => {
    const cachedData = localStorage.getItem('cachedArticles');
    if (cachedData) {
      try {
        const { articles: cachedArticles } = JSON.parse(cachedData);
        setState(prev => ({ 
          ...prev, 
          articles: cachedArticles,
          isLoadingArticles: false 
        }));
      } catch (e) {
        localStorage.removeItem('cachedArticles');
      }
    }
  }, []); // Only run once on mount

  // Handle data fetching after user is loaded
  useEffect(() => {
    if (!state.isUserLoaded) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem('cachedArticles');
        if (cachedData) {
          const { articles: cachedArticles, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;
          // Use cache if it's less than 15 minutes old
          if (cacheAge < 15 * 60 * 1000) {
            if (isMounted) {
              setState(prev => ({ 
                ...prev, 
                articles: cachedArticles,
                isLoadingArticles: false 
              }));
              // Fetch saved articles once
              await fetchSavedArticles();
              return;
            }
          }
        }

        // If cache is old or doesn't exist, fetch new data
        if (isMounted) {
          await fetchSavedArticles();
          await fetchArticles();
        }
      } catch (error) {
        console.error("Error during data fetch:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [state.isUserLoaded, fetchArticles, fetchSavedArticles]);

  const normalizeUrl = (url) => {
    if (!url) return '';
    try {
      // Remove protocol (http/https), 'www.', and trailing slashes
      return url
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .split('?')[0];
    } catch (e) {
      return url.toLowerCase();
    }
  };

  const isArticleSaved = useCallback((articleUrl, savedArticles) => {
    if (!articleUrl || !savedArticles?.length) return false;
    const normalizedArticleUrl = normalizeUrl(articleUrl);
    return savedArticles.some(
      savedArticle => normalizeUrl(savedArticle.url) === normalizedArticleUrl
    );
  }, []);

  const handleSaveArticle = async (article) => {
    if (!user?._id || !token) {
      navigate("/");
      return;
    }

    const normalizedUrl = normalizeUrl(article.url);
    
    // Check if article is already saved
    if (isArticleSaved(article.url, state.savedArticles)) {
      console.log("Article is already saved:", normalizedUrl);
      return;
    }

    try {
      console.log("Attempting to save article:", {
        userId: user._id,
        articleTitle: article.title,
        articleUrl: normalizedUrl
      });

      // Ensure all required fields are present
      if (!article.title || !article.url) {
        console.error("Missing required article fields:", article);
        return;
      }

      // Optimistically update UI
      setState(prev => ({
        ...prev,
        savedArticles: [...prev.savedArticles, {
          ...article,
          url: normalizedUrl,
          savedAt: new Date().toISOString()
        }]
      }));

      const response = await api.post(
        "/auth/saveArticle",
        {
          userId: user._id,
          article: {
            title: article.title,
            url: normalizedUrl,
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
      
      if (!response?.data?.savedArticle) {
        // Revert optimistic update if save failed
        setState(prev => ({
          ...prev,
          savedArticles: prev.savedArticles.filter(a => normalizeUrl(a.url) !== normalizedUrl)
        }));
      }
    } catch (error) {
      console.error("Error saving article:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Revert optimistic update on error
      setState(prev => ({
        ...prev,
        savedArticles: prev.savedArticles.filter(a => normalizeUrl(a.url) !== normalizedUrl)
      }));
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const handleRemoveArticle = async (article) => {
    if (!user?._id || !token) {
      navigate("/");
      return;
    }

    const normalizedUrl = normalizeUrl(article.url);

    try {
      // Optimistically update UI
      setState(prev => ({
        ...prev,
        savedArticles: prev.savedArticles.filter(
          savedArticle => normalizeUrl(savedArticle.url) !== normalizedUrl
        )
      }));

      const response = await api.post(
        "/auth/removeArticle",
        {
          userId: user._id,
          articleUrl: normalizedUrl
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status !== 200) {
        // Revert optimistic update if remove failed
        setState(prev => ({
          ...prev,
          savedArticles: [...prev.savedArticles, article]
        }));
      }
    } catch (error) {
      console.error("Error removing article:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // Revert optimistic update on error
      setState(prev => ({
        ...prev,
        savedArticles: [...prev.savedArticles, article]
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

  const { articles, savedArticles, isLoadingArticles, error } = state;

  if (isLoadingArticles && articles.length === 0) {
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
        {articles.map((article) => {
          const isSaved = isArticleSaved(article.url, savedArticles);

          return (
            <div key={normalizeUrl(article.url)} className="relative flex flex-col">
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
                  e.stopPropagation();
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

