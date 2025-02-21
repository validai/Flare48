import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// NEWS DATA API (Latest 48-hour news)
router.get("/news", async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}&language=en`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching news data" });
  }
});

// GOOGLE CUSTOM SEARCH API
router.get("/search", async (req, res) => {
  const query = req.query.q; // Get query from frontend
  try {
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1?q=${query}&key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CX_ID}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching search results" });
  }
});

// RAPID API Example Route
router.get("/extra", async (req, res) => {
  try {
    const response = await axios.get("https://example-rapidapi.com/data", {
      headers: { "X-RapidAPI-Key": process.env.RAPID_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching extra data" });
  }
});

export default router;
