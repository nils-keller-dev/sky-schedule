import { Location } from './Location'

export interface Flight extends Location {
  id: string
  heading: number
  groundSpeed: number
  originAirportIata?: string
  destinationAirportIata?: string
  onGround: number
}
