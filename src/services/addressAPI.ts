export interface AddressHit {
  score: number;
  place: {
    identifier: string;
    postalAddress: {
      addressCountry: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      streetAddress: string;
      inLanguage: string;
    };
    geo: {
      latitude: string;
      longitude: string;
    };
    additionalProperty: {
      buildingId: string;
      entranceId: string;
      addressId: string;
      municipalityCode: string;
    };
  };
}

export interface AddressSearchResponse {
  hits: AddressHit[];
}

export const searchAddresses = async (
  query: string,
  countryCode: string = 'CH',
  limit: number = 10,
  minScore: number = 88
): Promise<AddressSearchResponse> => {
  const params = new URLSearchParams({
    query,
    countryCode,
    limit: limit.toString(),
    minScore: minScore.toString(),
  });

  // Always use our reverse proxy to avoid CORS in any environment
  const baseUrl = '/api/address-search';
    
  const url = `${baseUrl}/find?${params}`;
  // console.log('Fetching URL:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  // console.log('Response status:', response.status);
  // console.log('Response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Response error:', errorText);
    throw new Error(`Address search failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  // console.log('Response data:', data);
  return data;
};