import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SavedArticles = () => {
  const [state, setState] = useState({
    savedArticles: [],
    isLoading: true,
    error: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved articles from local storage
    try {
      const savedData = localStorage.getItem('savedArticles');
      if (savedData) {
        const articles = JSON.parse(savedData);
        setState(prev => ({
          ...prev,
          savedArticles: articles,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          savedArticles: [],
          isLoading: false
        }));
      }
    } catch (error) {
      console.error("Error loading saved articles:", error);
      setState(prev => ({
        ...prev,
        error: "Failed to load saved articles",
        isLoading: false
      }));
    }
  }, []);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading saved articles...</h2>
          <p className="text-gray-600">Please wait while we fetch your saved articles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 relative">
      <button
        onClick={() => navigate("/news")}
        className="absolute top-4 left-4 p-2 text-gray-700 hover:scale-110"
      >
        <ArrowLeft size={30} />
      </button>

      <h1 className="text-4xl font-bold text-center text-gray-900">Saved Articles</h1>
      
      {state.error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {state.savedArticles.length > 0 ? (
          state.savedArticles.map((article, index) => (
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
                Saved on: {new Date(article.savedAt).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-black dark:text-black">
                Published: {new Date(article.publishedAt).toLocaleString()}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm text-blue-600 hover:underline block"
              >
                Read Full Article
              </a>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-lg text-gray-600">No saved articles yet.</p>
            <button
              onClick={() => navigate("/news")}
              className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Browse News
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedArticles;
