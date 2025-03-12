import React, { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
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
    // Array of API keys to try in sequence
    const apiKeys = [
      "227e827efba517c4a1b449b10d7bc2dd",
      "01008499182045707c100247f657ba5c",
      "b9e4c1c1b9b94b0d9d3f1f6c2f9e8d7" // Additional backup key
    ];

    let lastError = null;
    let attempts = 0;

    // Try each API key until one works
    for (const apiKey of apiKeys) {
      attempts++;
      try {
        console.log(`Attempting to fetch news with API key ${attempts}...`);
        
        const response = await axios.get(
          `https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=us&max=10&apikey=${apiKey}`,
          { timeout: 5000 } // Shorter timeout for faster fallback
        );

        if (response?.data?.articles?.length > 0) {
          const articles = response.data.articles.filter(article => 
            article.image && article.title && article.url
          );

          if (articles.length > 0) {
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

            console.log(`Successfully fetched ${articles.length} articles with API key ${attempts}`);
            return;
          }
        }
        
        // If we get here, the response was successful but had no valid articles
        throw new Error('No valid articles in response');
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
        console.error(`Error fetching articles with API key ${attempts}:`, errorMessage);
        lastError = error;
        
        // Add delay between attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }

    // If all API keys failed, try to load from cache
    console.log('All API attempts failed, trying cache...');
    let cachedArticles = [];
    try {
      const cachedData = localStorage.getItem('cachedArticles');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed && Array.isArray(parsed.articles) && parsed.articles.length > 0) {
          cachedArticles = parsed.articles;
          console.log(`Successfully loaded ${cachedArticles.length} articles from cache`);
        }
      }
    } catch (e) {
      console.error("Error parsing cached articles:", e);
    }

    setState(prev => ({ 
      ...prev, 
      articles: cachedArticles,
      isLoadingArticles: false,
      error: cachedArticles.length 
        ? `Using cached articles. All ${attempts} API attempts failed. Will retry in background.` 
        : `Failed to load articles. All ${attempts} API attempts failed. Please try again later.`
    }));

    // If using cached articles, try to refresh in the background after a delay
    if (cachedArticles.length > 0) {
      setTimeout(() => {
        fetchArticles().catch(console.error);
      }, 30000); // Try again after 30 seconds
    }
  }, []);

  const fetchSavedArticles = useCallback(async () => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      console.log('Checking auth state:', {
        hasUserData: !!userData,
        hasToken: !!token
      });

      if (!userData || !token) {
        console.log('No auth data found, redirecting to login');
        setState(prev => ({ ...prev, isLoadingSaved: false }));
        navigate('/');
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
        console.log('Parsed user data:', {
          hasId: !!user._id,
          email: user.email
        });
      } catch (e) {
        console.error('Failed to parse user data:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }
      
      if (!user._id) {
        console.error('Invalid user data:', user);
        setState(prev => ({ ...prev, isLoadingSaved: false }));
        navigate('/');
        return;
      }

      console.log('Fetching saved articles:', {
        userId: user._id,
        endpoint: `/auth/saved-articles/${user._id}`
      });

      const response = await api.get(`/auth/saved-articles/${user._id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Saved articles response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      if (response?.data?.savedArticles) {
        console.log(`Found ${response.data.savedArticles.length} saved articles`);
        setState(prev => ({
          ...prev,
          savedArticles: response.data.savedArticles,
          isLoadingSaved: false
        }));
      } else {
        console.warn('Invalid saved articles response format:', response.data);
        setState(prev => ({ 
          ...prev, 
          isLoadingSaved: false,
          savedArticles: []
        }));
      }
    } catch (error) {
      console.error('Error fetching saved articles:', {
        name: error.name,
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null
      });

      if (error.response?.status === 401) {
        console.log('Authentication failed, clearing credentials');
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
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      console.log('Checking auth state for save:', {
        hasUserData: !!userData,
        hasToken: !!token
      });

      if (!userData || !token) {
        console.log('No auth data found, redirecting to login');
        navigate('/');
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
        console.log('Parsed user data:', {
          hasId: !!user._id,
          email: user.email
        });
      } catch (e) {
        console.error('Failed to parse user data:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      if (!user._id) {
        console.error('Invalid user data:', user);
        navigate('/');
        return;
      }

      console.log('Saving article:', {
        userId: user._id,
        articleTitle: article.title
      });

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
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Save article response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      if (response.data?.savedArticle) {
        console.log('Article saved successfully');
        setState(prev => ({
          ...prev,
          savedArticles: [...prev.savedArticles, response.data.savedArticle]
        }));
      } else {
        console.warn('Invalid save article response:', response.data);
      }
    } catch (error) {
      console.error('Error saving article:', {
        name: error.name,
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null
      });

      if (error.response?.status === 401) {
        console.log('Authentication failed, clearing credentials');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  };

  const handleRemoveArticle = async (article) => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!userData || !token) {
        console.log('No user data or token found');
        navigate('/');
        return;
      }

      const user = JSON.parse(userData);
      
      if (!user._id) {
        console.log('Invalid user data:', user);
        navigate('/');
        return;
      }

      console.log('Removing article for user:', user._id);
      const response = await api.post('/auth/removeArticle',
        {
          userId: user._id,
          articleUrl: article.url
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Remove article response:', response.data);

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

