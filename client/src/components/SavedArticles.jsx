import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SavedArticles = () => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get user from session storage
  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    // Redirect if not authenticated
    if (!user || !token) {
      console.log("User not authenticated, redirecting to home");
      navigate("/");
      return;
    }

    const fetchSavedArticles = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state before fetching

        console.log("Fetching saved articles for user:", user._id);
        const response = await axios.get(
          `https://flare48-j45i.onrender.com/auth/saved-articles/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.data) {
          throw new Error("No data received from server");
        }

        console.log("Received saved articles:", response.data);
        setSavedArticles(response.data.savedArticles || []);
      } catch (err) {
        console.error("Error fetching saved articles:", err);
        const errorMessage = err.response?.data?.error || err.message || "Failed to load saved articles";
        setError(errorMessage);
        
        // If unauthorized, clear session and redirect
        if (err.response?.status === 401 || err.response?.status === 403) {
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("token");
          navigate("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedArticles();
  }, [user, token, navigate]);

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

      // Update local state after successful removal
      setSavedArticles(current => 
        current.filter(savedArticle => savedArticle.url !== article.url)
      );
    } catch (error) {
      console.error("Error removing article:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to remove article";
      alert(errorMessage);

      // If unauthorized, clear session and redirect
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  // If not authenticated, show message and redirect
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view your saved articles.</p>
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
          <h2 className="text-2xl font-bold mb-4">Loading saved articles...</h2>
          <p className="text-gray-600">Please wait while we fetch your saved articles.</p>
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
            onClick={() => navigate("/news")}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back to News
          </button>
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
