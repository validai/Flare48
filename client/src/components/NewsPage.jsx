import React, { useState, useEffect } from "react";
import axios from "axios";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Get user from session storage
  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = sessionStorage.getItem("token");
  
  // If no user, redirect to login page
  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }
  }, [user, token, navigate]);

  // Fetch saved articles from backend
  const fetchSavedArticles = async () => {
    try {
      const response = await axios.get(
        `https://flare48-j45i.onrender.com/auth/saved-articles/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSavedArticles(response.data.savedArticles || []);
    } catch (error) {
      console.error("Error fetching saved articles:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      // Check if we have cached articles and they're not too old
      const cachedData = localStorage.getItem('cachedArticles');
      if (cachedData) {
        const { articles: cachedArticles, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        // Use cache if it's less than 15 minutes old
        if (cacheAge < 15 * 60 * 1000) {
          setArticles(cachedArticles);
          return;
        }
      }

      const apiKey = "01008499182045707c100247f657ba5c";
      const currentDate = new Date();
      const pastDate = new Date(currentDate.getTime() - 48 * 60 * 60 * 1000);
      const formattedDate = pastDate.toISOString();

      const response = await axios.get(
        `https://gnews.io/api/v4/search?q=latest&from=${formattedDate}&sortby=publishedAt&token=${apiKey}&lang=en`
      );
      
      // Cache the new articles with timestamp
      localStorage.setItem('cachedArticles', JSON.stringify({
        articles: response.data.articles,
        timestamp: Date.now()
      }));
      
      setArticles(response.data.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      // If we have cached articles, use them as fallback
      const cachedData = localStorage.getItem('cachedArticles');
      if (cachedData) {
        const { articles: cachedArticles } = JSON.parse(cachedData);
        setArticles(cachedArticles);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch both articles and saved articles on mount
  useEffect(() => {
    if (user && token) {
      fetchArticles();
      fetchSavedArticles();
    }
  }, [user, token]);

  const handleSaveArticle = async (article) => {
    try {
      const response = await axios.post(
        "https://flare48-j45i.onrender.com/auth/saveArticle",
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
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state with the newly saved article
      setSavedArticles(prev => [...prev, response.data.savedArticle]);
      
      // Show success message
      alert("Article saved successfully!");
    } catch (error) {
      console.error("Error saving article:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to save article";
      alert(errorMessage);

      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const handleRemoveArticle = async (article) => {
    try {
      await axios.post(
        "https://flare48-j45i.onrender.com/auth/removeArticle",
        {
          userId: user._id,
          articleUrl: article.url
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state by removing the article
      setSavedArticles(current => 
        current.filter(savedArticle => savedArticle.url !== article.url)
      );
      
      // Show success message
      alert("Article removed successfully!");
    } catch (error) {
      console.error("Error removing article:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to remove article";
      alert(errorMessage);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading news...</h2>
          <p className="text-gray-600">Please wait while we fetch the latest articles.</p>
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
                onClick={() =>
                  isSaved ? handleRemoveArticle(article) : handleSaveArticle(article)
                }
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

