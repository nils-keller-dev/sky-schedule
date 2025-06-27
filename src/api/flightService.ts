import { Entity, Flight, FlightRadar24API } from 'flightradarapi'
import { Airport } from '../models/Airport.ts'
import { DetailedFlight } from '../models/DetailedFlight.ts'
import { FormattedFlight, RawFlight, Response } from '../models/Response.ts'
import { useShiftArray } from '../utils/useShiftArray.ts'
import { feetToMeters, formatString } from '../utils/utils.ts'
import airports_de from '../data/airports_de.json' with { type: 'json' }
import airports_en from '../data/airports_en.json' with { type: 'json' }

const airportLanguageMap = {
  de: airports_de,
  en: airports_en,
}

const frApi = new FlightRadar24API()

const { shiftArray: cachedFlights, push: pushCache } = useShiftArray<
  DetailedFlight
>()

export const getClosestFlight = async (
  latitude: number,
  longitude: number,
  searchRadius: number,
  maxAltitude: number,
  language: 'de' | 'en',
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

  const airports = airportLanguageMap[language]

  let detailedFlight = cachedFlights.find(
    (cachedFlight) =>
      cachedFlight.identification?.id === closestFlight.flight.id,
  )

  if (!detailedFlight) {
    detailedFlight = await frApi.getFlightDetails(
      closestFlight.flight,
    ) as DetailedFlight
    pushCache(detailedFlight)
  }

  const rawFlight = processFlight(
    detailedFlight,
    closestFlight.flight,
    airports,
  )

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
  detailedFlight: DetailedFlight,
  flight: Flight,
  airports: Record<string, Airport>,
): RawFlight => ({
  id: flight.id ?? detailedFlight.identification.id,
  aircraft: detailedFlight.aircraft?.model?.text,
  airline: detailedFlight.airline?.code
    ? detailedFlight.airline.name
    : undefined,
  altitude: feetToMeters(flight.altitude ?? detailedFlight.trail[0].alt) ||
    undefined,
  number: flight.callsign ?? detailedFlight.identification.callsign,
  origin: getCityAndCountry(airports, detailedFlight, 'origin'),
  destination: getCityAndCountry(airports, detailedFlight, 'destination'),
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
