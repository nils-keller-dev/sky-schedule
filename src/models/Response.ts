export interface Response {
  origin?: ResponseAirport
  destination?: ResponseAirport
}

interface ResponseAirport {
  city?: string
  country: string
}
