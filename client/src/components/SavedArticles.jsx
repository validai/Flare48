import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://flare48-j45i.onrender.com',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Enhanced user data validation
const getUserData = () => {
  try {
    const userData = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    
    if (!userData || !token) {
      return { user: null, token: null };
    }

    const parsedUser = JSON.parse(userData);
    
    // Strict validation of user data
    if (!parsedUser || typeof parsedUser !== 'object' || !parsedUser._id) {
      console.error("Invalid or incomplete user data:", parsedUser);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      return { user: null, token: null };
    }

    // Validate token format (should be a non-empty string)
    if (typeof token !== 'string' || !token.trim()) {
      console.error("Invalid token format");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      return { user: null, token: null };
    }

    return { user: parsedUser, token };
  } catch (error) {
    console.error("Error parsing user data:", error);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    return { user: null, token: null };
  }
};

const SavedArticles = () => {
  const [state, setState] = useState({
    savedArticles: [],
    isLoading: true,
    error: null
  });
  const navigate = useNavigate();

  // Get user data with strict validation
  const { user, token } = getUserData();

  const fetchSavedArticles = useCallback(async () => {
    if (!user?._id || !token) {
      navigate("/");
      return;
    }

    try {
      console.log("Fetching saved articles for user:", user._id);
      const response = await api.get(
        `/auth/saved-articles/${user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("Saved articles response:", response.data);

      if (response?.data?.savedArticles) {
        setState(prev => ({ 
          ...prev, 
          savedArticles: response.data.savedArticles,
          isLoading: false,
          error: null
        }));
      }
    } catch (error) {
      console.error("Error fetching saved articles:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      setState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Failed to fetch saved articles",
        isLoading: false
      }));

      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      }
    }
  }, [user, token, navigate]);

  // Fetch saved articles only on component mount and when user/token changes
  useEffect(() => {
    if (!user?._id || !token) {
      navigate("/");
      return;
    }

    fetchSavedArticles();

    // No intervals or continuous polling
  }, [user, token, navigate, fetchSavedArticles]);

  const normalizeUrl = (url) => {
    try {
      // Remove query parameters and trailing slashes
      return url.split('?')[0].replace(/\/$/, '');
    } catch (e) {
      return url;
    }
  };

  const handleRemoveArticle = async (article) => {
    if (!user?._id || !token) {
      navigate("/");
      return;
    }

    try {
      console.log("Removing article:", article.url);
      const response = await api.post(
        "/auth/removeArticle",
        {
          userId: user._id,
          articleUrl: normalizeUrl(article.url)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        console.log("Article removed successfully");
        // Update state with normalized URLs
        setState(prev => ({
          ...prev,
          savedArticles: prev.savedArticles.filter(
            savedArticle => normalizeUrl(savedArticle.url) !== normalizeUrl(article.url)
          ),
          error: null
        }));
      } else {
        console.error("Failed to remove article:", response.data);
        setState(prev => ({
          ...prev,
          error: "Failed to remove article. Please try again."
        }));
      }
    } catch (error) {
      console.error("Error removing article:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      setState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Failed to remove article"
      }));

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
