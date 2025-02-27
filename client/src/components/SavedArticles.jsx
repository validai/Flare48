import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SavedArticles = () => {
  const [savedArticles, setSavedArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedArticles")) || [];
    setSavedArticles(saved);
  }, []);

  const handleRemoveArticle = (article) => {
    const updatedSavedArticles = savedArticles.filter(
      (savedArticle) => savedArticle.url !== article.url
    );
    setSavedArticles(updatedSavedArticles);
    localStorage.setItem("savedArticles", JSON.stringify(updatedSavedArticles));
  };

  return (
    <div className="container mx-auto px-4 py-20 relative">
      <button
        onClick={() => navigate("/news")}
        className="absolute top-4 left-4 p-2 text-gray-700 hover:scale-110"
      >
        <ArrowLeft size={30} />
      </button>

      <h1 className="text-4xl font-bold text-center text-gray-900">Saved Articles</h1>
      <p className="mt-4 text-lg text-center text-gray-600">
        Here are the articles you've saved.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {savedArticles.length > 0 ? (
          savedArticles.map((article, index) => (
            <div
              key={index}
              className="relative block p-4 bg-white dark:bg-neutral-100 border border-neutral-700 shadow-lg rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <img
                src={article.image || "https://via.placeholder.com/300"}
                alt={article.title}
                className="w-full h-52 object-cover rounded-xl"
              />
              <h3 className="mt-4 text-lg font-semibold text-black dark:text-black">
                {article.title}
              </h3>
              <p className="mt-2 text-sm text-black dark:text-black">
                {new Date(article.publishedAt).toLocaleString()}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Read Full Article
              </a>

              <button
                onClick={() => handleRemoveArticle(article)}
                className="absolute bottom-4 right-4 p-2 text-black hover:scale-110"
              >
                <Trash2 size={25} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-lg text-gray-600">No saved articles yet.</p>
        )}
      </div>
    </div>
  );
};

export default SavedArticles;
