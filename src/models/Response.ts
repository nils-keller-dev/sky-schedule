export interface Response {
  altitude?: number
  origin?: ResponseAirport
  destination?: ResponseAirport
}

interface ResponseAirport {
  city?: string
  country: string
}
