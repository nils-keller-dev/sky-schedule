export interface Response {
  aircraft?: string
  altitude?: number
  number: string
  origin?: ResponseAirport
  destination?: ResponseAirport
}

interface ResponseAirport {
  city?: string
  country: string
}
