import { FlightRadar24API } from 'flightradarapi'
import airports from '../data/airports.json'
import { Airport } from '../models/Airport'
import { Flight } from '../models/Flight'
import { Response } from '../models/Response'
import calculateTimeToReach from '../utils/routeCalculation'

const frApi = new FlightRadar24API()

export const getVisibleFlights = async (
  latitude: number,
  longitude: number,
  searchRadius: number,
  visibilityRadius: number
) => {
  const bounds = frApi.getBoundsByPoint(latitude, longitude, searchRadius)
  const flights = await frApi.getFlights(null, bounds)

  return flights
    .filter(
      (flight: Flight) => !flight.onGround || !flight.destinationAirportIata
    )
    .map((flight: Flight) =>
      processFlight(flight, latitude, longitude, visibilityRadius)
    )
    .filter((result: Response) => result)
}

const processFlight = (
  flight: Flight,
  latitude: number,
  longitude: number,
  visibilityRadius: number
): Response | null => {
  if (!flight.originAirportIata || !flight.destinationAirportIata) return null

  const airportOrigin: Airport =
    airports[flight.originAirportIata as keyof typeof airports]
  const airportDestination: Airport =
    airports[flight.destinationAirportIata as keyof typeof airports]

  if (!airportOrigin || !airportDestination) return null

  // const { estimatedEntryTime, estimatedExitTime } = calculateEstimatedTimes(
  //   flight,
  //   {
  //     latitude: airportDestination.latitude,
  //     longitude: airportDestination.longitude,
  //   },
  //   { latitude, longitude },
  //   visibilityRadius
  // )

  const timeToReach = calculateTimeToReach(
    flight,
    {
      latitude: airportDestination.latitude,
      longitude: airportDestination.longitude,
    },
    {
      latitude,
      longitude,
    },
    visibilityRadius
  )

  if (timeToReach === null) return null

  return {
    id: flight.id,
    airportOrigin: {
      city: airportOrigin.city,
      country: airportOrigin.country,
    },
    airportDestination: {
      city: airportDestination.city,
      country: airportDestination.country,
    },
    estimatedEntryTime: timeToReach,
    estimatedExitTime: timeToReach,
    requestTime: Date.now(),
  }
}
