import fastify from 'fastify'
import { getClosestFlight } from './api/flightService'

const app = fastify({ logger: true })

const routeOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        radius: { type: 'number', minimum: 1 },
        maxAltitude: { type: 'number', minimum: 0, default: Infinity },
        language: { type: 'string', enum: ['en', 'de'], default: 'en' },
        accentedName: { type: 'boolean', default: true },
      },
      required: ['location', 'radius'],
    },
  },
}

interface BoundsQuery {
  location: string
  radius: number
  maxAltitude?: number
  language?: string
  accentedName?: boolean
}

app.get<{ Querystring: BoundsQuery }>(
  '/closestPlane',
  routeOptions,
  async (request) => {
    const { location, radius, maxAltitude, language, accentedName } =
      request.query
    const [latitude, longitude] = location.split(',').map(Number)

    return await getClosestFlight(
      latitude,
      longitude,
      radius,
      maxAltitude,
      language,
      accentedName
    )
  }
)

export default app
