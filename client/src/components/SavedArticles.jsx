import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

const SavedArticles = () => {
  const [state, setState] = useState({
    savedArticles: [],
    isLoading: true,
    error: null
  });
  const navigate = useNavigate();

  const handleRemoveArticle = async (article) => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!userData || !token) {
        console.log('No user data or token found');
        navigate('/');
        return;
      }

      const user = JSON.parse(userData);
      
      if (!user._id) {
        console.log('Invalid user data:', user);
        navigate('/');
        return;
      }

      console.log('Removing article:', {
        userId: user._id,
        articleUrl: article.url
      });

      const response = await api.post('/auth/removeArticle',
        {
          userId: user._id,
          articleUrl: article.url
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Remove article response:', response.data);

      // Update local state to remove the article
      setState(prev => ({
        ...prev,
        savedArticles: prev.savedArticles.filter(saved => saved.url !== article.url)
      }));
    } catch (error) {
      console.error("Error removing article:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  };

  useEffect(() => {
    const fetchSavedArticles = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        console.log('Checking auth state:', {
          hasUserData: !!userData,
          hasToken: !!token
        });

        if (!userData || !token) {
          console.log('No auth data found, redirecting to login');
          setState(prev => ({ ...prev, isLoading: false }));
          navigate('/');
          return;
        }

        let user;
        try {
          user = JSON.parse(userData);
          console.log('Parsed user data:', {
            hasId: !!user._id,
            email: user.email
          });
        } catch (e) {
          console.error('Failed to parse user data:', e);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        
        if (!user._id) {
          console.error('Invalid user data:', user);
          setState(prev => ({ ...prev, isLoading: false }));
          navigate('/');
          return;
        }

        console.log('Fetching saved articles:', {
          userId: user._id,
          endpoint: `/auth/saved-articles/${user._id}`
        });

        const response = await api.get(`/auth/saved-articles/${user._id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('Saved articles response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });

        if (response?.data?.savedArticles) {
          console.log(`Found ${response.data.savedArticles.length} saved articles`);
          setState(prev => ({
            ...prev,
            savedArticles: response.data.savedArticles,
            isLoading: false
          }));
        } else {
          console.warn('Invalid saved articles response format:', response.data);
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: "Invalid response format from server"
          }));
        }
      } catch (error) {
        console.error('Error fetching saved articles:', {
          name: error.name,
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          } : null
        });

        if (error.response?.status === 401) {
          console.log('Authentication failed, clearing credentials');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/');
        }
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: error.response?.data?.error || "Failed to fetch saved articles"
        }));
      }
    };

    fetchSavedArticles();
  }, [navigate]);

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
              <div className="flex justify-between items-center mt-4">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Read Full Article
                </a>
                <button
                  onClick={() => handleRemoveArticle(article)}
                  className="p-2 text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                  title="Remove from saved articles"
                >
                  <Trash2 size={20} />
                </button>
              </div>
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
