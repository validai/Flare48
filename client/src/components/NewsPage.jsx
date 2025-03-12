import React, { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
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
    isLoadingArticles: true,
    error: null
  });

  // Add the fetchArticles function
  const fetchArticles = useCallback(async () => {
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
  }, []);

  // Handle data fetching
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem('cachedArticles');
        if (cachedData) {
          const { articles: cachedArticles, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;
          // Use cache if it's less than 15 minutes old
          if (cacheAge < 15 * 60 * 1000 && isMounted) {
            setState(prev => ({ 
              ...prev, 
              articles: cachedArticles,
              isLoadingArticles: false 
            }));
            return;
          }
        }

        // If cache is old or doesn't exist, fetch new data
        if (isMounted) {
          await fetchArticles();
        }
      } catch (error) {
        console.error("Error during data fetch:", error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: "Failed to load content. Please try again later.",
            isLoadingArticles: false
          }));
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchArticles]);

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
        {articles.map((article) => (
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;

