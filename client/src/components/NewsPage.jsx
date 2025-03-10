import React, { useState, useEffect } from "react";
import axios from "axios";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedArticles")) || [];
    setSavedArticles(saved);
  }, []);

  // Retrieve user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem("user"));
  
  // If no user, redirect to login page
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchArticles = async () => {
    const apiKey = "01008499182045707c100247f657ba5c";
    const currentDate = new Date();
    const pastDate = new Date(currentDate.getTime() - 48 * 60 * 60 * 1000);
    const formattedDate = pastDate.toISOString();

    try {
      const response = await axios.get(
        `https://gnews.io/api/v4/search?q=latest&from=${formattedDate}&sortby=publishedAt&token=${apiKey}&lang=en`
      );
      setArticles(response.data.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSaveArticle = async (article) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SAVE_ARTICLE_URL,
        {
          userId: user?._id, // Pass the logged-in user's ID
          article: {
            title: article.title,
            url: article.url,
            image: article.image,
            publishedAt: article.publishedAt,
          },
        }
      );
      console.log(response.data.message);
    } catch (error) {
      console.error("Error saving article:", error);
    }
  };

  const handleRemoveArticle = async (article) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_REMOVE_ARTICLE_URL,
        {
          userId: user?._id, // Pass the logged-in user's ID
          articleUrl: article.url,
        }
      );
      console.log(response.data.message);
    } catch (error) {
      console.error("Error removing article:", error);
    }
  };

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

