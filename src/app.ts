import { getClosestFlight } from './api/flightService.ts'

interface QueryParams {
  location?: string
  radius?: string
  maxAltitude?: string
  language?: string
  countryBlacklist?: string
}

const closestPlane = async (query: QueryParams) => {
  const { location, radius, maxAltitude, language, countryBlacklist } = query

  if (!location || !radius) {
    return null
  }

  const [latitude, longitude] = location.split(',').map(Number)

  return await getClosestFlight(
    latitude,
    longitude,
    Number(radius),
    Number(maxAltitude) || Infinity,
    language ?? 'en',
    countryBlacklist?.split(',') ?? [],
  )
}

export default closestPlane
