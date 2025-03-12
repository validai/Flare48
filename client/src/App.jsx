import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import WelcomeHero from "./components/WelcomeHero";
import NewsPage from "./components/NewsPage";
import Footer from "./components/Footer";
import SavedArticles from "./components/SavedArticles";
import ThreeNewsSection from "./components/ThreeNewsSection";
// import GoogleAuthCallback from "./components/GoogleAuthCallback"; // Commented out Google auth

function App() {
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
        <Route path="/news" element={<NewsPage />} />
        <Route path="/saved-articles" element={<SavedArticles />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
