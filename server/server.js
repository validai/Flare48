const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 6000; // Render auto-assigns PORT

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
