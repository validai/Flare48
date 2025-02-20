import React, { useState } from "react";

const SearchBox = () => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    window.open(
      `https://www.google.com/search?q=${query}&cx=${import.meta.env.VITE_GOOGLE_CX_ID}`,
      "_blank"
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search the web..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default SearchBox;
