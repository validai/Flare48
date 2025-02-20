const GOOGLE_SEARCH_API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
const GOOGLE_CX_ID = import.meta.env.VITE_GOOGLE_CX_ID;

export async function fetchGoogleSearch(query) {
  const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_CX_ID}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching Google search results:", error);
    return [];
  }
}
