export interface Response {
  id?: string
  aircraft?: string
  altitude?: number
  airline?: string
  distance?: number
  number?: string
  origin?: ResponseAirport
  destination?: ResponseAirport
}

interface ResponseAirport {
  city?: string
  country: string
}
