import { Entity, FlightRadar24API } from 'flightradarapi'
import { Airport } from '../models/Airport.ts'
import { DetailedFlight } from '../models/DetailedFlight.ts'
import { Response, ResponseAirport } from '../models/Response.ts'
import { feetToMeters } from '../utils/utils.ts'

const frApi = new FlightRadar24API()

export const getClosestFlight = async (
  latitude: number,
  longitude: number,
  searchRadius: number,
  maxAltitude: number,
  language: string,
  countryBlacklist: string[],
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
    ...processFlight(detailedFlight, airports.default, countryBlacklist),
    distance: Math.round(closestFlight.distance * 1000),
  }
}

const processFlight = (
  flight: DetailedFlight,
  airports: Record<string, Airport>,
  countryBlacklist: string[],
): Response => {
  const countryCodeOrigin = flight.airport.origin?.position.country.code ?? ''
  const countryCodeDestination =
    flight.airport.destination?.position.country.code ?? ''

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
    origin: getCityAndCountry(
      airportOrigin,
      countryBlacklist.includes(countryCodeOrigin),
    ),
    destination: getCityAndCountry(
      airportDestination,
      countryBlacklist.includes(countryCodeDestination),
    ),
  }
}

const getCityAndCountry = (
  airport: Airport | undefined,
  removeCountry?: boolean,
): ResponseAirport | undefined => {
  if (!airport) return undefined

  const { city, country } = airport
  if (!city && (!country || removeCountry)) return undefined

  return {
    city,
    country: removeCountry ? undefined : country,
  }
}
