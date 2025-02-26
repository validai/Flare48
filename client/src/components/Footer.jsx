import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black dark:bg-neutral-900 text-white dark:text-neutral-300 py-6 text-center">
      <p className="text-sm">&copy; {new Date().getFullYear()} YourWebsite. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
