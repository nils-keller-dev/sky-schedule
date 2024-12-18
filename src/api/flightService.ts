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
): RawFlight => ({
  id: flight.identification.id,
  aircraft: flight.aircraft.model.text,
  airline: flight.airline?.code ? flight.airline.name : undefined,
  altitude: feetToMeters(flight.trail[0].alt) || undefined,
  number: flight.identification.callsign,
  origin: getCityAndCountry(airports, flight, 'origin'),
  destination: getCityAndCountry(airports, flight, 'destination'),
})

const getCityAndCountry = (
  airports: Record<string, Airport>,
  flight: DetailedFlight,
  target: 'origin' | 'destination',
) => {
  const countryCode = flight.airport[target]?.position.country.code
  const iata = flight.airport[target]?.code.iata
  const airport: Airport | undefined = airports[iata ?? -1]
  const city = airport?.city
  const country = airport?.country

  if (!city && !country && !countryCode && !iata) {
    return undefined
  }

  return {
    city,
    country,
    countryCode,
    iata,
  }
}
