import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import WelcomeHero from "./components/WelcomeHero";
import NewsPage from "./components/NewsPage";
import ThreeNewsSection from "./components/ThreeNewsSection";
import Footer from "./components/Footer";
import FAQ from "./components/FAQ";
import SavedArticles from "./components/SavedArticles"; // Import the SavedArticles component

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <WelcomeHero />
              <ThreeNewsSection />
              <FAQ />
            </>
          }
        />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/saved-articles" element={<SavedArticles />} /> {/* New route for saved articles */}
      </Routes>
      <Footer />
    </>
  );
}

export default App;
