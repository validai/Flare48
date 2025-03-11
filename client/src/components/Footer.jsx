import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black dark:bg-neutral-900 text-white dark:text-neutral-300 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Flare48</h3>
            <p className="text-sm text-gray-400">
              Your source for the latest news from the past 48 hours, curated and personalized just for you.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-400 hover:text-white transition">
                  Latest News
                </Link>
              </li>
              <li>
                <Link to="/saved-articles" className="text-gray-400 hover:text-white transition">
                  Saved Articles
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                <a href="mailto:contact@flare48.com" className="hover:text-white transition">
                  contact@flare48.com
                </a>
              </li>
              <li className="text-gray-400">
                United States
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/flare48"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com/company/flare48"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:contact@flare48.com"
                className="text-gray-400 hover:text-white transition"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Flare48. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
