import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WelcomeHero = () => {
  console.log("WelcomeHero component rendered");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const images = [
    "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bmV3cyUyMGFydGljbGVzfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bmV3c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];

  useEffect(() => {
    console.log("useEffect triggered - Image Slideshow");
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleModal = (type) => {
    console.log(`toggleModal triggered - Type: ${type}`);
    setIsSignup(type === "signup");
    setIsModalOpen(!isModalOpen);
    setError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    const formData = {
      email: e.target.email.value.trim(),
      password: e.target.password.value.trim(),
      username: e.target.username?.value.trim(), 
    };
  
    const backendUrl = "https://flare48-6c1x.onrender.com";
    const REGISTER_URL = `${backendUrl}/auth/register`;
    const LOGIN_URL = `${backendUrl}/auth/login`;
    
    try {
      const endpoint = isSignup ? REGISTER_URL : LOGIN_URL;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
    
      let data;
      try {
        data = await response.json();
      } catch (err) {
        setError("Server response was not in the expected format");
        setIsLoading(false);
        return;
      }
    
      if (response.ok) {
        console.log("Success:", data);
  
        sessionStorage.setItem("user", JSON.stringify({ 
          _id: data.userId, 
          username: data.username || formData.username, 
          email: formData.email 
        }));
        sessionStorage.setItem("token", data.token);
  
        navigate("/news");
      } else {
        setError(data?.message || `Failed to ${isSignup ? 'sign up' : 'log in'}. Please try again.`);
      }
    } catch (error) {
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleGoogleAuth = () => {
    console.log("Google OAuth button clicked");
    const backendUrl = "https://flare48-6c1x.onrender.com";
    window.location.href = `${backendUrl}/auth/google`;
  };
  

  return (
    <section className="container mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold text-black leading-tight">
            Welcome to <span className="text-primary-500">Flare48</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-black leading-relaxed max-w-lg mx-auto md:mx-0">
            Your go-to source for the latest news from the past 48 hours.
          </p>
          <div className="mt-6 flex gap-4 justify-center md:justify-start">
            <button
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition"
              onClick={() => toggleModal("signup")}
            >
              Get Started
            </button>
            <button
              className="px-6 py-3 bg-white text-black border-2 border-black rounded-lg hover:bg-neutral-200 transition"
              onClick={() => toggleModal("login")}
            >
              Login
            </button>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <img
            src={images[currentImageIndex]}
            alt="News"
            className="rounded-xl shadow-lg w-full h-[350px] md:h-[450px] lg:h-[550px] transition-all duration-500 object-cover"
          />
        </div>
      </div>

      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full relative">
      <h2 className="text-2xl font-bold mb-4 text-black">
        {isSignup ? "Sign Up" : "Login"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleFormSubmit}>
        {isSignup && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-black" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full p-3 mt-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-black" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-3 mt-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-black" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full p-3 mt-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 bg-black text-white rounded-lg transition ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-800'
          }`}
        >
          {isLoading ? 'Please wait...' : (isSignup ? "Sign Up" : "Log In")}
        </button>
      </form>

      <button
        type="button"
        className={`w-full py-3 mt-4 bg-neutral-600 text-white rounded-lg transition ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-700'
        }`}
        onClick={handleGoogleAuth}
        disabled={isLoading}
      >
        Continue with Google
      </button>

      <button
        type="button"
        className="w-full py-2 mt-4 text-black hover:text-neutral-600 text-sm"
        onClick={() => setIsModalOpen(false)}
        disabled={isLoading}
      >
        Close
      </button>
    </div>
  </div>
)}

    </section>
  );
};

export default WelcomeHero;

