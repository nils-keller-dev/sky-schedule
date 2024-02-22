import fastify from 'fastify'
import { getVisibleFlights } from './api/FlightService'

const app = fastify({ logger: true })

const routeOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        searchRadius: { type: 'number', minimum: 1 },
        visibilityRadius: { type: 'number', minimum: 1 },
      },
      required: ['location', 'searchRadius', 'visibilityRadius'],
    },
  },
}

interface BoundsQuery {
  location: string
  searchRadius: number
  visibilityRadius: number
}

app.get<{ Querystring: BoundsQuery }>(
  '/flights',
  routeOptions,
  async (request) => {
    const { location, searchRadius, visibilityRadius } = request.query
    const [latitude, longitude] = location.split(',').map(Number)

    const visibleFlights = await getVisibleFlights(
      latitude,
      longitude,
      searchRadius,
      visibilityRadius
    )

    return { flights: visibleFlights }
  }
)

export default app
