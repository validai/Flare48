import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";  // Updated to use Home
import NewsPage from "./components/NewsPage";
import Footer from "./components/Footer";
import SavedArticles from "./components/SavedArticles";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />   {/* Home is now the main page */}
        <Route path="/news" element={<NewsPage />} />
        <Route path="/saved-articles" element={<SavedArticles />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
