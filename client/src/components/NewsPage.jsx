import React, { useState, useEffect } from "react";
import axios from "axios";
import { Heart } from "lucide-react";

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedArticles")) || [];
    setSavedArticles(saved);
  }, []);

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

  const handleSaveArticle = (article) => {
    const updatedSavedArticles = [...savedArticles, article];
    setSavedArticles(updatedSavedArticles);
    localStorage.setItem("savedArticles", JSON.stringify(updatedSavedArticles));
  };

  const handleRemoveArticle = (article) => {
    const updatedSavedArticles = savedArticles.filter(
      (savedArticle) => savedArticle.url !== article.url
    );
    setSavedArticles(updatedSavedArticles);
    localStorage.setItem("savedArticles", JSON.stringify(updatedSavedArticles));
  };

  return (
    <div className="container mx-auto px-4 py-20 relative">
      <h1 className="text-4xl font-bold text-center text-gray-900">Welcome to the News Page</h1>
      <p className="mt-4 text-lg text-center text-gray-600">
        Here are the latest trending news articles from the past 48 hours.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, index) => {
          const isSaved = savedArticles.some((savedArticle) => savedArticle.url === article.url);

          return (
            <div
              key={index}
              className="relative flex flex-col max-w-full bg-white dark:bg-neutral-100 border border-neutral-700 shadow-lg rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 h-full"
              >
                <img
                  src={article.image || "https://via.placeholder.com/300"}
                  alt={article.title}
                  className="w-full h-48 md:h-64 object-cover rounded-xl mb-4"
                />
                <h3 className="text-lg font-semibold text-black dark:text-black line-clamp-3">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-black dark:text-black">
                  {new Date(article.publishedAt).toLocaleString()}
                </p>
              </a>

              <button
                onClick={() =>
                  isSaved ? handleRemoveArticle(article) : handleSaveArticle(article)
                }
                className={`absolute bottom-4 right-4 p-2 transition-colors duration-300 ease-in-out 
                  ${isSaved ? "fill-red-500" : "text-black"}`}
              >
                {isSaved ? (
                  <Heart className="fill-red-500" size={25} />
                ) : (
                  <Heart className="text-black" size={25} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsPage;
