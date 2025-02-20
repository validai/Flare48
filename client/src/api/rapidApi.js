const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;

export async function fetchRapidApiData(endpoint) {
  const url = `https://your-rapidapi-endpoint.com/${endpoint}`;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": RAPID_API_KEY,
      "X-RapidAPI-Host": "your-rapidapi-host.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching RapidAPI data:", error);
    return [];
  }
}
