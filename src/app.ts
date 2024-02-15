import fastify from 'fastify'
import { FlightRadar24API } from 'flightradarapi'
import airports from '../airports.json'
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
    console.log(flights)

    const calculatedTimes = flights
      .filter((e: Flight) => !e.onGround || !e.destinationAirportIata)
      .map((f: Flight) => {
        // @ts-ignore
        const airportOrigin = airports[f.originAirportIata]
        // @ts-ignore
        const airportDestination = airports[f.destinationAirportIata]

        if (!airportDestination?.latitude) {
          // TODO try to check if the plane will pass the target without knowing where its going just based on heading and currentPos
          return
        }

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
          2.5
        )

        return {
          timeToReach,
          airportOrigin: {
            city: airportOrigin.city,
            country: airportOrigin.country,
          },
          airportDestination: {
            city: airportDestination.city,
            country: airportDestination.country,
          },
        }
      })
      .filter((r: Response) => r)
      .filter((r: Response) => r.timeToReach !== null)

    return { flights: calculatedTimes }
  }
)

export default app
