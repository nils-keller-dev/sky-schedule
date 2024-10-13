import { Entity, Flight, FlightRadar24API } from 'flightradarapi'
import aircrafts from '../data/aircrafts.json'
import { Airport } from '../models/Airport'
import { Response } from '../models/Response'
import { feetToMeters } from '../utils'

const frApi = new FlightRadar24API()

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

  const closestFlight = flights
    .filter((flight) => !flight.onGround && flight.altitude < maxAltitude)
    .map((flight) => ({
      flight,
      distance: flight.getDistanceFrom({ latitude, longitude } as Entity),
    }))
    .sort((a, b) => a.distance - b.distance)[0]?.flight

  if (!closestFlight) return {}

  const airports = await import(`../data/airports_${language}.json`)

  return processFlight(closestFlight, airports, accentedName)
}

const processFlight = (
  flight: Flight,
  airports: Record<string, Airport>,
  accentedName: boolean
): Response => {
  const airportOrigin: Airport | undefined = airports[flight.originAirportIata]
  const airportDestination: Airport | undefined =
    airports[flight.destinationAirportIata]

  const aircraft = aircrafts[flight.aircraftCode as keyof typeof aircrafts]

  return {
    aircraft,
    altitude: feetToMeters(flight.altitude) || undefined,
    number: flight.number,
    origin: getCityAndCountry(airportOrigin, accentedName),
    destination: getCityAndCountry(airportDestination, accentedName),
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
