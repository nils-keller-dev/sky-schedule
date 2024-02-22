import fastify from 'fastify'
import { getVisibleFlights } from './api/flightService'

const app = fastify({ logger: true })

const routeOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        searchRadius: { type: 'number', minimum: 1 },
        visibilityRadius: { type: 'number', minimum: 1 },
        maxAltitude: { type: 'number', minimum: 0 },
      },
      required: ['location', 'searchRadius', 'visibilityRadius'],
    },
  },
}

interface BoundsQuery {
  location: string
  searchRadius: number
  visibilityRadius: number
  maxAltitude?: number
}

app.get<{ Querystring: BoundsQuery }>(
  '/flights',
  routeOptions,
  async (request) => {
    const { location, searchRadius, visibilityRadius, maxAltitude } =
      request.query

    const [latitude, longitude] = location.split(',').map(Number)

    const visibleFlights = await getVisibleFlights(
      latitude,
      longitude,
      searchRadius,
      visibilityRadius,
      maxAltitude
    )

    return { flights: visibleFlights }
  }
)

export default app
