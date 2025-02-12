import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10); // Ensure PORT is a number

app.use(express.json());

// Debug log to confirm the server is starting
console.log("🛠️ Starting Flare48 API...");
console.log(`🔍 Environment PORT: ${process.env.PORT}`);
console.log(`🔍 Resolved PORT: ${PORT}`);

// API Route to confirm it's live
app.get("/", (req: express.Request, res: express.Response) => {
  res.send("✅ Flare48 API is running successfully!");
  console.log("✅ Request received at /");
});

// Force Keep-Alive Log to Prevent Render Shutdown
setInterval(() => {
  console.log("💡 Keep-alive ping - Server is still running...");
}, 10000);

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is officially running on: http://0.0.0.0:${PORT}/`);
  console.log(`📡 Send a request to test: curl https://your-app-name.onrender.com/`);
});
