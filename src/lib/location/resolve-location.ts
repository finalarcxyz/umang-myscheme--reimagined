export interface Location {
  state: string;
  district: string;
}

interface NominatimAddress {
  state?: string;
  state_district?: string;
  county?: string;
  district?: string;
  city_district?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
  error?: string;
}

export class LocationResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocationResolutionError';
  }
}

function cleanDistrictName(district: string) {
  return district.replace(/\s+district$/i, '').trim();
}

export async function resolveLocation(
  latitude: number,
  longitude: number
): Promise<Location> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new LocationResolutionError('The browser returned invalid coordinates.');
  }

  const query = new URLSearchParams({
    format: 'jsonv2',
    lat: latitude.toString(),
    lon: longitude.toString(),
    zoom: '10',
    addressdetails: '1',
    'accept-language': 'en',
  });
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${query.toString()}`,
      {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new LocationResolutionError(
        'The location service is unavailable right now.'
      );
    }

    const result = (await response.json()) as NominatimResponse;
    const state = result.address?.state?.trim();
    const district = [
      result.address?.state_district,
      result.address?.county,
      result.address?.district,
      result.address?.city_district,
    ].find((value): value is string => Boolean(value?.trim()));

    if (!state || !district) {
      throw new LocationResolutionError(
        'Your coordinates could not be resolved to a state and district.'
      );
    }

    return {
      state,
      district: cleanDistrictName(district),
    };
  } catch (error) {
    if (error instanceof LocationResolutionError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new LocationResolutionError('Location lookup timed out.');
    }

    throw new LocationResolutionError(
      'Automatic location lookup could not be completed.'
    );
  } finally {
    window.clearTimeout(timeout);
  }
}
