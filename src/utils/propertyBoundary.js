import L from 'leaflet';

export async function getPropertyBoundaries(propertyIds, maxRetries = 3, delayMs = 1000) {
  const fetchWithRetry = async (attempt = 0) => {
    try {
      const url = new URL('https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme/MapServer/12/query');
      
      const propIdQuery = `propid IN (${propertyIds.join(',')})`;
      url.searchParams.append('where', propIdQuery);
      url.searchParams.append('outFields', '*');
      url.searchParams.append('returnGeometry', 'true');
      url.searchParams.append('outSR', '4326');
      url.searchParams.append('f', 'json');

      const response = await fetch(url);
      
      if (!response.ok) {
        if (attempt < maxRetries) {
          console.log(`Retry attempt ${attempt + 1} of ${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return fetchWithRetry(attempt + 1);
        }
        throw new Error('Failed to fetch property boundaries');
      }
      
      const data = await response.json();
      return data.features?.map(feature => ({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: feature.geometry.rings
        },
        properties: feature.attributes
      })) || [];
    } catch (error) {
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt + 1} of ${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return fetchWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  try {
    return await fetchWithRetry();
  } catch (error) {
    console.error('Error fetching property boundaries after retries:', error);
    return [];
  }
} 