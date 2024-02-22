export interface Response {
  timeToReach: number | null
  airportOrigin: {
    city: string
    country: string
  }
  airportDestination: {
    city: string
    country: string
  }
  estimatedEntryTime: number
  estimatedExitTime: number
  requestTime: number
}
