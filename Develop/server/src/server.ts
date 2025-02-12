import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10); // ✅ Fix port type

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Flare48 API is running...");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
