import { Flight } from '../models/Flight'
import { Location } from '../models/Location'
import { degreesToRadians, knotsToKmh, radiansToDegrees } from './converters'

const R = 6371 // Radius of the Earth in kilometers

const calculateDistance = (locaton1: Location, location2: Location) => {
  const dLat = degreesToRadians(location2.latitude - locaton1.latitude)
  const dLon = degreesToRadians(location2.longitude - locaton1.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(locaton1.latitude)) *
      Math.cos(degreesToRadians(location2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const calculateBearing = (from: Location, to: Location) => {
  const lat1 = degreesToRadians(from.latitude)
  const lon1 = degreesToRadians(from.longitude)
  const lat2 = degreesToRadians(to.latitude)
  const lon2 = degreesToRadians(to.longitude)

  const dLon = lon2 - lon1
  const y = Math.sin(dLon) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  return (radiansToDegrees(Math.atan2(y, x)) + 360) % 360
}

const calculateEstimatedTimes = (
  flight: Flight,
  destinationPos: Location,
  targetPos: Location,
  radiusKm: number
): { millisUntilEntry: number | null; millisUntilExit: number | null } => {
  const currentBearing = calculateBearing(flight, destinationPos)
  const targetBearing = calculateBearing(flight, targetPos)
  const bearingDifference = Math.abs(currentBearing - targetBearing)
  const groundSpeedKmh = knotsToKmh(flight.groundSpeed)

  if (bearingDifference > 90 && bearingDifference < 270) {
    return { millisUntilEntry: null, millisUntilExit: null }
  }

  const distanceToTargetKm = calculateDistance(flight, targetPos)
  const timeToTargetHours = distanceToTargetKm / groundSpeedKmh
  const millisUntilEntry =
    distanceToTargetKm <= radiusKm ? 0 : timeToTargetHours * 3600 * 1000
  const millisUntilExit =
    millisUntilEntry + (radiusKm / groundSpeedKmh) * 3600 * 1000

  return {
    millisUntilEntry,
    millisUntilExit,
  }
}

export default calculateEstimatedTimes
