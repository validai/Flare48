const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 6000; // Render auto-assigns PORT

app.use(express.static(path.join(__dirname, "../client")));
res.sendFile(path.join(__dirname, "../client/index.html"));


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
