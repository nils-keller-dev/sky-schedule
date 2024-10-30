import { Entity, Flight, FlightRadar24API } from 'flightradarapi'
import aircrafts from '../data/aircrafts.json' with { type: 'json' }
import airlines from '../data/airlines.json' with { type: 'json' }
import { Airport } from '../models/Airport.ts'
import { Response } from '../models/Response.ts'
import { feetToMeters, getFromJson } from '../utils/utils.ts'

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

  return {
    ...processFlight(closestFlight.flight, airports.default),
    distance: Math.round(closestFlight.distance * 1000),
  }
}

const processFlight = (
  flight: Flight,
  airports: Record<string, Airport>,
): Response => {
  const airportOrigin: Airport | undefined = airports[flight.originAirportIata]
  const airportDestination: Airport | undefined =
    airports[flight.destinationAirportIata]

  return {
    id: flight.id,
    aircraft: getFromJson(flight.aircraftCode, aircrafts),
    airline: getFromJson(flight.airlineIata, airlines),
    altitude: feetToMeters(flight.altitude) || undefined,
    number: flight.number,
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
