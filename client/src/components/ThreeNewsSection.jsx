import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ThreeNewsSection = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const apiKey = "01008499182045707c100247f657ba5c";
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

        setArticles(filteredArticles);
      } catch (error) {
        console.error("Error fetching news:", error);
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
          onClick={() => navigate("/news")}
          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1"
        >
          View All
        </button>
      </div>
    </section>
  );
};

export default ThreeNewsSection;
