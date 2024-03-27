import express from "express";
import axios from "axios";

const router = express.Router();

// Helper function to fetch a single page of results
async function fetchPage(url, apiKey, nextPageToken = '', callCounter) {
  let fetchUrl = url;
  if (nextPageToken) {
    // Wait as required by Google API before fetching the next page
    await new Promise(resolve => setTimeout(resolve, 2000));
    fetchUrl += `&pagetoken=${nextPageToken}`;
  }

  const response = await axios.get(fetchUrl);
  console.log(`Call #${callCounter}: Fetched a page of results`);
  return response.data;
}

// Function to recursively fetch all pages of results using Text Search
async function fetchAllResults(query, apiKey, allResults = [], nextPageToken = '', callCounter = 1) {
  const encodedQuery = encodeURIComponent(query);
  console.log(encodedQuery);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${apiKey}`;
  const data = await fetchPage(url, apiKey, nextPageToken, callCounter);
  allResults.push(...data.results);

  if (data.next_page_token) {
    // Increment the call counter for each subsequent fetch
    return fetchAllResults(query, apiKey, allResults, data.next_page_token, callCounter + 1);
  } else {
    console.log(`Total API calls made: ${callCounter}`);
    return allResults;
  }
}

router.post('/api/nearby-dentists', async (req, res) => {
  const { stateName } = req.body; // Expecting state name instead of latitude and longitude
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  console.log('name',stateName);
  // Constructing the query to find dentists in the specified state
  const query = `dentists in ${stateName}`;

  try {
    const results = await fetchAllResults(query, apiKey);
    console.log(`Fetched all dentists in ${stateName}: ${results.length}`);
    res.json(results);
  } catch (error) {
    console.error('Error fetching dentists:', error.message);
    res.status(500).send('Error fetching dentists');
  }
});

export default router;
