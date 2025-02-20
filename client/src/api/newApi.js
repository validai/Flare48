const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

export async function fetchNews(query = "latest") {
  const url = `https://newsdata.io/api/1/latest?apikey=${NEWS_API_KEY}&q=${query}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}
