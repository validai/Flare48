import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WelcomeHero = () => {
  console.log("WelcomeHero component rendered");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    const formData = {
      email: e.target.email.value.trim(),
      password: e.target.password.value.trim(),
      username: e.target.username?.value.trim(), 
    };
  
 
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  
    try {
      const endpoint = isSignup ? "register" : "login";
      const response = await fetch(`${BACKEND_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error("Failed to parse JSON response:", err);
        throw new Error("Invalid response from server");
      }
  
      if (response.ok) {
        console.log("Success:", data);
        navigate("/news"); 
      } else {
        console.error("Error:", data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  

  const handleGoogleAuth = () => {
    console.log("Google OAuth button clicked");
    window.location.href = "http://localhost:3000/auth/google";
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
            <form onSubmit={handleFormSubmit}>
              {isSignup && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black" htmlFor="username">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="w-full p-3 mt-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter your username"
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
                  className="w-full p-3 mt-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter your email"
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
                  className="w-full p-3 mt-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition"
              >
                {isSignup ? "Sign Up" : "Log In"}
              </button>
              <button
                type="button"
                className="w-full py-3 mt-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                onClick={handleGoogleAuth}
              >
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full py-2 mt-4 text-black hover:text-neutral-600 text-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default WelcomeHero;

