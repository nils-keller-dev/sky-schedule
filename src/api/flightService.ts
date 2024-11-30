import { Entity, FlightRadar24API } from 'flightradarapi'
import { Airport } from '../models/Airport.ts'
import { DetailedFlight } from '../models/DetailedFlight.ts'
import { Response } from '../models/Response.ts'
import { feetToMeters } from '../utils/utils.ts'

const frApi = new FlightRadar24API()

export const getClosestFlight = async (
  latitude: number,
  longitude: number,
  searchRadius: number,
  maxAltitude: number,
  language: string,
): Promise<Response> => {
  const bounds = frApi.getBoundsByPoint(latitude, longitude, searchRadius)
  const flights = await frApi.getFlights(null, bounds)

  const closestFlight = flights
    .filter((flight) => !flight.onGround && flight.altitude < maxAltitude)
    .map((flight) => ({
      flight,
      distance: flight.getDistanceFrom({ latitude, longitude } as Entity),
    }))
    .sort((a, b) => a.distance - b.distance)[0]

  if (!closestFlight) return {}

  const airports = await import(`../data/airports_${language}.json`, {
    with: { type: 'json' },
  })

  const detailedFlight = await frApi.getFlightDetails(
    closestFlight.flight,
  ) as DetailedFlight

  return {
    ...processFlight(detailedFlight, airports.default),
    distance: Math.round(closestFlight.distance * 1000),
  }
}

const processFlight = (
  flight: DetailedFlight,
  airports: Record<string, Airport>,
): Response => {
  const airportOrigin: Airport | undefined =
    airports[flight.airport.origin?.code.iata ?? -1]
  const airportDestination: Airport | undefined =
    airports[flight.airport.destination?.code.iata ?? -1]

  return {
    id: flight.identification.id,
    aircraft: flight.aircraft.model.text,
    airline: flight.airline.code ? flight.airline.name : undefined,
    altitude: feetToMeters(flight.trail[0].alt) || undefined,
    number: flight.identification.callsign,
    origin: getCityAndCountry(airportOrigin),
    destination: getCityAndCountry(airportDestination),
  }
}

const getCityAndCountry = (
  airport: Airport | undefined,
) => (
  airport && {
    city: airport.city,
    country: airport.country,
  }
)
