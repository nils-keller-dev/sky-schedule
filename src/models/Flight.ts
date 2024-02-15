import { Location } from './Location'

export interface Flight extends Location {
  heading: number
  groundSpeed: number
  originAirportIata?: string
  destinationAirportIata?: string
  onGround: number
}
