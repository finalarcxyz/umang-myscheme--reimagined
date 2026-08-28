// Mock reverse geocoding function
// In a real application, this would call a backend service that uses a
// geocoding API (like OpenCage, Google Maps, etc.) to convert latitude/longitude
// to administrative divisions (state, district).
// For this prototype, we return a fixed response for Odisha.

export interface Location {
  state: string;
  district: string;
}

export async function resolveLocation(
  latitude: number,
  longitude: number
): Promise<Location> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock response: always return Odisha and Khordha (capital district)
  // NOTE: This is a mock and does not reflect the actual location.
  return {
    state: 'Odisha',
    district: 'Khordha',
  };
}
