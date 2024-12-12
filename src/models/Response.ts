export type Response = RawFlight | FormattedFlight

export interface FormattedFlight {
  id?: string
  primaryTop?: string
  primaryBottom?: string
  secondaryTop?: string
  secondaryBottom?: string
}

export interface RawFlight {
  id?: string
  aircraft?: string
  altitude?: number
  airline?: string
  distance?: number
  number?: string
  origin?: ResponseAirport
  destination?: ResponseAirport
}

export interface ResponseAirport {
  city?: string
  country: string
  countryCode?: string
  iata?: string
}
