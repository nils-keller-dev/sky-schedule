import { Entity, Flight, FlightRadar24API } from 'flightradarapi'
import { Airport } from '../models/Airport'
import { Response } from '../models/Response'
import { feetToMeters } from '../utils'

const frApi = new FlightRadar24API()

type ProcessedFlight = Response & { distance: number }

export const getClosestFlight = async (
  latitude: number,
  longitude: number,
  searchRadius: number,
  maxAltitude = Infinity,
  language = 'en',
  accentedName = true
) => {
  const bounds = frApi.getBoundsByPoint(latitude, longitude, searchRadius)
  const flights = await frApi.getFlights(null, bounds)

  const airports = await import(`../data/airports_${language}.json`)

  const closestPlane = flights
    .filter((flight) => !flight.onGround && flight.altitude < maxAltitude)
    .map((flight) =>
      processFlight(flight, latitude, longitude, airports.default, accentedName)
    )
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
  longitude: number,
  airports: Record<string, Airport>,
  accentedName: boolean
): ProcessedFlight => {
  const airportOrigin: Airport | undefined = airports[flight.originAirportIata]
  const airportDestination: Airport | undefined =
    airports[flight.destinationAirportIata]

  const distance = flight.getDistanceFrom({ latitude, longitude } as Entity)

  return {
    altitude: feetToMeters(flight.altitude) || undefined,
    origin: getCityAndCountry(airportOrigin, accentedName),
    destination: getCityAndCountry(airportDestination, accentedName),
    distance,
  }
}

const getCityAndCountry = (
  airport: Airport | undefined,
  accentedName: boolean
) => {
  return (
    airport && {
      city: accentedName ? airport.city : removeAccents(airport.city),
      country: accentedName ? airport.country : removeAccents(airport.country),
    }
  )
}

const removeAccents = <T extends string | undefined>(str: T): T => {
  if (!str) return str
  const withoutUmlauts = str
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('Ä', 'Ae')
    .replaceAll('Ö', 'Oe')
    .replaceAll('Ü', 'Ue')
  return withoutUmlauts.normalize('NFD').replace(/[\u0300-\u036f]/g, '') as T
}
