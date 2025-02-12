import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10); // Ensure PORT is a number

app.use(express.json());

// Log environment variables for debugging
console.log("🛠️ ENVIRONMENT VARIABLES:");
console.log("➡️ PORT:", PORT);
console.log("➡️ NODE_ENV:", process.env.NODE_ENV);

// Debug API Route
app.get("/", (req: express.Request, res: express.Response) => {
  res.send("✅ Flare48 API is running successfully!");
  console.log("✅ Request received at /");
});

// Force Keep-Alive Log to Prevent Render from Auto-Closing
setInterval(() => {
  console.log("💡 Keep-alive ping - Server is still running...");
}, 10000); // Log every 10 seconds to prevent shutdown

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`🌍 Accessible at: http://0.0.0.0:${PORT}/`);
});
