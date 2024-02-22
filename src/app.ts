import fastify from 'fastify'
import { FlightRadar24API } from 'flightradarapi'
import airports from './data/airports.json'
import { Airport } from './models/Airport'
import { Flight } from './models/Flight'
import { Response } from './models/Response'
import calculateTimeToReach from './utils/routeCalculation'

const frApi = new FlightRadar24API()
const app = fastify({ logger: true })

const routeOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        searchRadius: { type: 'number' },
        visibilityRadius: { type: 'number' },
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
  '/',
  routeOptions,
  async ({ query: { location, searchRadius, visibilityRadius } }) => {
    const requestTime = Date.now()

    const [lat, long] = location.split(',').map(Number)
    const bounds = frApi.getBoundsByPoint(lat, long, searchRadius)
    const flights = await frApi.getFlights(null, bounds)

    console.log(flights)

    const calculatedTimes = flights
      .filter((e: Flight) => !e.onGround || !e.destinationAirportIata)
      .map((f: Flight) => {
        if (!f.originAirportIata || !f.destinationAirportIata) return null

        const airportOrigin: Airport =
          airports[f.originAirportIata as keyof typeof airports]
        const airportDestination: Airport =
          airports[f.destinationAirportIata as keyof typeof airports]

        if (!airportOrigin || !airportDestination) return null

        const timeToReach = calculateTimeToReach(
          f,
          {
            latitude: airportDestination.latitude,
            longitude: airportDestination.longitude,
          },
          {
            latitude: lat,
            longitude: long,
          },
          visibilityRadius
        )

        if (timeToReach === null) return null

        return {
          id: f.id,
          airportOrigin: {
            city: airportOrigin.city,
            country: airportOrigin.country,
          },
          airportDestination: {
            city: airportDestination.city,
            country: airportDestination.country,
          },
          estimatedEntryTime: timeToReach,
          estimatedExitTime: 0,
          requestTime,
        }
      })
      .filter((r: Response | null) => r)

    return { flights: calculatedTimes }
  }
)

export default app
