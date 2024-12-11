import { Entity, FlightRadar24API } from 'flightradarapi'
import { Airport } from '../models/Airport.ts'
import { DetailedFlight } from '../models/DetailedFlight.ts'
import { FormattedFlight, RawFlight, Response } from '../models/Response.ts'
import { feetToMeters, formatString } from '../utils/utils.ts'

const frApi = new FlightRadar24API()

export const getClosestFlight = async (
  latitude: number,
  longitude: number,
  searchRadius: number,
  maxAltitude: number,
  language: string,
  formatStrings: string[],
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

  const rawFlight = processFlight(detailedFlight, airports.default)

  return {
    ...formatFlight(rawFlight, formatStrings),
    ...rawFlight,
    distance: Math.round(closestFlight.distance * 1000),
  }
}

const formatFlight = (
  flight: RawFlight,
  formatStrings: string[],
): FormattedFlight => {
  const keys = [
    'primaryTop',
    'primaryBottom',
    'secondaryTop',
    'secondaryBottom',
  ]

  const returnValue: FormattedFlight = {}

  keys.forEach((key, index) => {
    returnValue[key as keyof FormattedFlight] = formatString(
      formatStrings[index] ?? '',
      flight,
    )
  })

  return returnValue
}

const processFlight = (
  flight: DetailedFlight,
  airports: Record<string, Airport>,
): RawFlight => {
  const countryCodeOrigin = flight.airport.origin?.position.country.code
  const countryCodeDestination = flight.airport.destination?.position.country
    .code

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
    origin: getCityAndCountry(airportOrigin, countryCodeOrigin),
    destination: getCityAndCountry(airportDestination, countryCodeDestination),
  }
}

const getCityAndCountry = (
  airport?: Airport,
  countryCode?: string,
) => {
  if (!airport) return undefined

  return {
    city: airport.city,
    country: airport.country,
    countryCode,
  }
}
