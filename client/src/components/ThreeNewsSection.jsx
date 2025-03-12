import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ThreeNewsSection = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  const handleViewAll = () => {
    const user = sessionStorage.getItem("user");
    if (!user) {
      // If not authenticated, scroll to top where login/signup is
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // You could also add a message or highlight the login button here
    } else {
      navigate("/news");
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Check if we have cached preview articles and they're not too old
        const cachedData = localStorage.getItem('cachedPreviewArticles');
        if (cachedData) {
          const { articles: cachedArticles, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;
          // Use cache if it's less than 15 minutes old
          if (cacheAge < 15 * 60 * 1000) {
            setArticles(cachedArticles);
            return;
          }
        }

        const apiKey = import.meta.env.VITE_NEWS_API_KEY_1;
        const currentDate = new Date();
        const pastDate = new Date(currentDate.getTime() - 48 * 60 * 60 * 1000);
        const formattedDate = pastDate.toISOString();

        const response = await axios.get(
          `https://gnews.io/api/v4/search?q=latest&from=${formattedDate}&sortby=publishedAt&token=${apiKey}&lang=en`
        );

        let filteredArticles = response.data.articles;
        filteredArticles = filteredArticles
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);

        // Cache the new preview articles with timestamp
        localStorage.setItem('cachedPreviewArticles', JSON.stringify({
          articles: filteredArticles,
          timestamp: Date.now()
        }));

        setArticles(filteredArticles);
      } catch (error) {
        console.error("Error fetching news:", error);
        // If we have cached preview articles, use them as fallback
        const cachedData = localStorage.getItem('cachedPreviewArticles');
        if (cachedData) {
          const { articles: cachedArticles } = JSON.parse(cachedData);
          setArticles(cachedArticles);
        }
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="p-8 bg-white dark:bg-black">
      <h2 className="text-3xl font-bold text-center mb-6 text-black dark:text-white">
        Latest News
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white dark:bg-black border border-black dark:border-white shadow-lg rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <img
                src={article.image || "https://via.placeholder.com/300"}
                alt={article.title}
                className="w-full h-52 object-cover rounded-xl"
              />
              <h3 className="mt-4 text-lg font-semibold text-black dark:text-white">
                {article.title}
              </h3>
              <p className="mt-2 text-sm text-black dark:text-gray-300">
                {new Date(article.publishedAt).toLocaleString()}
              </p>
            </a>
          ))
        ) : (
          <p className="text-center text-black dark:text-gray-300">
            Loading news...
          </p>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleViewAll}
          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1"
        >
          {sessionStorage.getItem("user") ? "View All" : "Sign in to View All"}
        </button>
      </div>
    </section>
  );
};

export default ThreeNewsSection;
