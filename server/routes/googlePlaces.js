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

// Function to recursively fetch all pages of results
async function fetchAllResults(url, apiKey, allResults = [], nextPageToken = '', callCounter = 1) {
  const data = await fetchPage(url, apiKey, nextPageToken, callCounter);
  allResults.push(...data.results);

  if (data.next_page_token) {
    // Increment the call counter for each subsequent fetch
    return fetchAllResults(url, apiKey, allResults, data.next_page_token, callCounter + 1);
  } else {
    console.log(`Total API calls made: ${callCounter}`);
    return allResults;
  }
}

router.post('/api/nearby-dentists', async (req, res) => {
  const { latitude, longitude, radius } = req.body;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=dentist&key=${apiKey}`;

  try {
    const results = await fetchAllResults(baseUrl, apiKey);
    console.log(`Fetched all nearby dentists: ${results.length}`);
    res.json(results);
  } catch (error) {
    console.error('Error fetching nearby dentists:', error.message);
    res.status(500).send('Error fetching nearby dentists');
  }
});

export default router;
