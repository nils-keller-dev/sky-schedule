import fastify from 'fastify'
import { FlightRadar24API } from 'flightradarapi'

const frApi = new FlightRadar24API()
const app = fastify({ logger: true })

const routeOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        long: { type: 'number' },
        radius: { type: 'number' },
      },
      required: ['lat', 'long', 'radius'],
    },
  },
}

interface BoundsQuery {
  lat: number
  long: number
  radius: number
}

app.get<{ Querystring: BoundsQuery }>(
  '/',
  routeOptions,
  async ({ query: { lat, long, radius } }) => {
    const bounds = frApi.getBoundsByPoint(lat, long, radius)
    const flights = await frApi.getFlights(null, bounds)
    return { flights }
  }
)

export default app
