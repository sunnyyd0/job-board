import axios from "axios";
import { parseStringPromise } from "xml2js";

export const fetchJobsFromFeed = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 15000 });
    const xmlData = response.data;
    const parsed = await parseStringPromise(xmlData, {
      explicitArray: false,
      mergeAttrs: true,
    });
    // typical RSS: parsed.rss.channel.item
    const items = parsed?.rss?.channel?.item;
    if (!items) {
      console.log(`⚠️ No jobs found for ${url}`);
      return [];
    }
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error(`❌ Error fetching from ${url}:`, error.message);
    return [];
  }
};
