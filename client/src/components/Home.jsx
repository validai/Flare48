import React from "react";
import Navbar from "./Navbar";
import ThreeNewsSection from "./ThreeNewsSection";
import FAQ from "./FAQ";
import Footer from "./Footer";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-12">
        {/* News Section */}
        <ThreeNewsSection />
      </main>
      
      {/* FAQ Section */}
      <section className="bg-gray-100 py-12">
        <FAQ />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
