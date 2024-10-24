import { getClosestFlight } from './api/flightService.ts'

interface QueryParams {
  location?: string
  radius?: string
  maxAltitude?: string
  language?: string
}

const closestPlane = async (query: QueryParams) => {
  const { location, radius, maxAltitude, language } = query

  if (!location || !radius) {
    return {
      body: 'Missing required parameters',
      init: { status: 400 },
    }
  }

  const [latitude, longitude] = location.split(',').map(Number)

  const response = await getClosestFlight(
    latitude,
    longitude,
    Number(radius),
    Number(maxAltitude) ?? Infinity,
    language ?? 'en',
  )

  return {
    body: JSON.stringify(response),
    init: {
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
    },
  }
}

export default closestPlane
