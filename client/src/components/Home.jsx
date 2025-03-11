import React from "react";
import Navbar from "./Navbar";
import News from "./News"; // Added missing News section
import ThreeNewsSection from "./ThreeNewsSection";
import FAQ from "./FAQ";
import Footer from "./Footer";

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Navigation Bar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-6 py-12 space-y-12">
                {/* News Section */}
                <section>
                    <News />
                </section>

                {/* Featured Articles Section */}
                <section>
                    <ThreeNewsSection />
                </section>
            </main>

            {/* FAQ Section */}
            <section className="bg-white py-12 border-t">
                <div className="container mx-auto px-6">
                    <FAQ />
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Home;
