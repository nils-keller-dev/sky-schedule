import { Entity, Flight, FlightRadar24API } from 'flightradarapi'
import airports from '../data/airports.json'
import { Airport } from '../models/Airport'
import { Response } from '../models/Response'

const frApi = new FlightRadar24API()

type ProcessedFlight = Response & { distance: number }

export const getVisibleFlights = async (
  latitude: number,
  longitude: number,
  searchRadius: number,
  maxAltitude = Infinity
) => {
  const bounds = frApi.getBoundsByPoint(latitude, longitude, searchRadius)
  const flights = await frApi.getFlights(null, bounds)

  const closestPlane = flights
    .filter((flight) => !flight.onGround && flight.altitude < maxAltitude)
    .map((flight) => processFlight(flight, latitude, longitude))
    .filter((result: ProcessedFlight | null) => result !== null)
    .sort(
      (a: ProcessedFlight, b: ProcessedFlight) => a.distance - b.distance
    )[0]

  return {
    ...closestPlane,
    distance: undefined,
  }
}

const processFlight = (
  flight: Flight,
  latitude: number,
  longitude: number
): ProcessedFlight | null => {
  const airportOrigin: Airport | undefined =
    airports[flight.originAirportIata as keyof typeof airports]

  if (!airportOrigin) return null

  const distance = flight.getDistanceFrom({ latitude, longitude } as Entity)

  return {
    city: airportOrigin.city,
    country: airportOrigin.country,
    distance,
  }
}
