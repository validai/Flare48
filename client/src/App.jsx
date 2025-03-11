import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import WelcomeHero from "./components/WelcomeHero";
import NewsPage from "./components/NewsPage";
import Footer from "./components/Footer";
import SavedArticles from "./components/SavedArticles";
import ThreeNewsSection from "./components/ThreeNewsSection";
import GoogleAuthCallback from "./components/GoogleAuthCallback";

function App() {
  // Check if user is authenticated
  const isAuthenticated = () => {
    const user = sessionStorage.getItem("user");
    return !!user;
  };

  // Protected Route wrapper component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <WelcomeHero />
            <ThreeNewsSection />
          </>
        } />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
        <Route path="/news" element={
          <ProtectedRoute>
            <NewsPage />
          </ProtectedRoute>
        } />
        <Route path="/saved-articles" element={
          <ProtectedRoute>
            <SavedArticles />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
