import React, { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://flare48-j45i.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

const NewsPage = () => {
  const [state, setState] = useState({
    articles: [],
    savedArticles: [],
    isLoadingArticles: true,
    isLoadingSaved: true,
    error: null
  });
  const navigate = useNavigate();

  // Add the fetchArticles function
  const fetchArticles = useCallback(async () => {
    try {
      const apiKey = "01008499182045707c100247f657ba5c";
      const response = await axios.get(
        `https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=us&max=10&apikey=${apiKey}`
      );

      if (response?.data?.articles) {
        const articles = response.data.articles.filter(article => 
          article.image && article.title && article.url
        );

        localStorage.setItem('cachedArticles', JSON.stringify({
          articles,
          timestamp: Date.now()
        }));

        setState(prev => ({ 
          ...prev, 
          articles,
          isLoadingArticles: false,
          error: null
        }));
      }
    } catch (error) {
      console.error("Error fetching articles:", error?.response?.data || error);
      
      // Try to load from cache first
      let cachedArticles = [];
      try {
        const cachedData = localStorage.getItem('cachedArticles');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          if (parsed && Array.isArray(parsed.articles)) {
            cachedArticles = parsed.articles;
          }
        }
      } catch (e) {
        console.error("Error parsing cached articles:", e);
      }

      setState(prev => ({ 
        ...prev, 
        articles: cachedArticles,
        isLoadingArticles: false,
        error: cachedArticles.length ? "Using cached articles. Please refresh later." : "Failed to load articles. Please try again later."
      }));
    }
  }, []);

  const fetchSavedArticles = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (!user?._id || !token) {
      setState(prev => ({ ...prev, isLoadingSaved: false }));
      return;
    }

    try {
      const response = await api.get(`/auth/saved-articles/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response?.data?.savedArticles) {
        setState(prev => ({
          ...prev,
          savedArticles: response.data.savedArticles,
          isLoadingSaved: false
        }));
      }
    } catch (error) {
      console.error("Error fetching saved articles:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
      }
      setState(prev => ({ 
        ...prev, 
        isLoadingSaved: false,
        savedArticles: []
      }));
    }
  }, [navigate]);

  // Handle data fetching
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        let shouldFetchNew = true;
        
        // Check cache first
        try {
          const cachedData = localStorage.getItem('cachedArticles');
          if (cachedData) {
            const { articles: cachedArticles, timestamp } = JSON.parse(cachedData);
            const cacheAge = Date.now() - timestamp;
            // Use cache if it's less than 15 minutes old
            if (cacheAge < 15 * 60 * 1000 && isMounted && Array.isArray(cachedArticles)) {
              setState(prev => ({ 
                ...prev, 
                articles: cachedArticles,
                isLoadingArticles: false,
                error: null
              }));
              shouldFetchNew = false;
            }
          }
        } catch (e) {
          console.error("Error reading cache:", e);
        }

        if (shouldFetchNew) {
          await fetchArticles();
        }

        // Always fetch saved articles
        await fetchSavedArticles();
      } catch (error) {
        console.error("Error during data fetch:", error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: "Failed to load content. Please try again later.",
            isLoadingArticles: false,
            isLoadingSaved: false
          }));
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchArticles, fetchSavedArticles]);

  const handleSaveArticle = async (article) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user?._id || !token) {
      navigate('/');
      return;
    }

    try {
      const response = await api.post('/auth/saveArticle', 
        {
          userId: user._id,
          article: {
            title: article.title,
            url: article.url,
            image: article.image,
            publishedAt: article.publishedAt
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data?.savedArticle) {
        setState(prev => ({
          ...prev,
          savedArticles: [...prev.savedArticles, response.data.savedArticle]
        }));
      }
    } catch (error) {
      console.error("Error saving article:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  };

  const handleRemoveArticle = async (article) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user?._id || !token) {
      navigate('/');
      return;
    }

    try {
      await api.post('/auth/removeArticle',
        {
          userId: user._id,
          articleUrl: article.url
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setState(prev => ({
        ...prev,
        savedArticles: prev.savedArticles.filter(saved => saved.url !== article.url)
      }));
    } catch (error) {
      console.error("Error removing article:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  };

  const isArticleSaved = (articleUrl) => {
    return state.savedArticles.some(saved => saved.url === articleUrl);
  };

  const { articles, isLoadingArticles, error } = state;

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
          const isSaved = isArticleSaved(article.url);
          
          return (
            <div key={article.url} className="relative flex flex-col">
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

