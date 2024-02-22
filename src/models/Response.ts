export interface Response {
  id: string
  airportOrigin: {
    city?: string
    country: string
  }
  airportDestination: {
    city?: string
    country: string
  }
  estimatedEntryTime: number
  estimatedExitTime: number
  requestTime: number
}
