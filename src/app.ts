import { getClosestFlight } from './api/flightService.ts'

export interface QueryParams {
  location?: string
  radius?: string
  maxAltitude?: string
  language?: string
  format?: string
}

const closestPlane = async (query: QueryParams) => {
  const { location, radius, maxAltitude, language, format } = query

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
    format?.split(';') ?? [],
  )
}

export default closestPlane
