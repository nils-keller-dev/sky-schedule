import { Entity, Flight, FlightRadar24API } from 'npm:flightradarapi'
import aircrafts from '../data/aircrafts.json' with { type: 'json' }
import airlines from '../data/airlines.json' with { type: 'json' }
import { Airport } from '../models/Airport.ts'
import { Response } from '../models/Response.ts'
import { feetToMeters, getFromJson, removeAccents } from '../utils.ts'

const frApi = new FlightRadar24API()

export const getClosestFlight = async (
  latitude: number,
  longitude: number,
  searchRadius: number,
  maxAltitude: number,
  language: string,
  accentedName: boolean,
) => {
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
    ...processFlight(closestFlight.flight, airports.default, accentedName),
    distance: Math.round(closestFlight.distance * 1000),
  }
}

const processFlight = (
  flight: Flight,
  airports: Record<string, Airport>,
  accentedName: boolean,
): Response => {
  const airportOrigin: Airport | undefined = airports[flight.originAirportIata]
  const airportDestination: Airport | undefined =
    airports[flight.destinationAirportIata]

  return {
    aircraft: getFromJson(flight.aircraftCode, aircrafts),
    airline: getFromJson(flight.airlineIata, airlines),
    altitude: feetToMeters(flight.altitude) || undefined,
    number: flight.number,
    origin: getCityAndCountry(airportOrigin, accentedName),
    destination: getCityAndCountry(airportDestination, accentedName),
  }
}

const getCityAndCountry = (
  airport: Airport | undefined,
  accentedName: boolean,
) => {
  return (
    airport && {
      city: accentedName ? airport.city : removeAccents(airport.city),
      country: accentedName ? airport.country : removeAccents(airport.country),
    }
  )
}
