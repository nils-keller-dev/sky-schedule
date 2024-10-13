export interface Response {
  aircraft?: string
  altitude?: number
  airline?: string
  number: string
  origin?: ResponseAirport
  destination?: ResponseAirport
}

interface ResponseAirport {
  city?: string
  country: string
}
