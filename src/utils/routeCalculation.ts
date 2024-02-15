import { Location } from '../models/Location'
import { Flight } from '../models/Flight'
import { degreesToRadians, knotsToKmh, radiansToDegrees } from './converters'

const R = 6371 // Earth radius in kilometers

// Haversine formula to calculate the great-circle distance between two points
function haversineDistance(start: Location, end: Location) {
  const dLat = degreesToRadians(end.latitude - start.latitude)
  const dLon = degreesToRadians(end.longitude - start.longitude)
  const lat1 = degreesToRadians(start.latitude)
  const lat2 = degreesToRadians(end.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Calculate the initial bearing from one point to another
function calculateBearing(pos1: Location, pos2: Location) {
  const phi1 = degreesToRadians(pos1.latitude)
  const phi2 = degreesToRadians(pos2.latitude)
  const lambda1 = degreesToRadians(pos1.longitude)
  const lambda2 = degreesToRadians(pos2.longitude)

  const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2)
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1)
  return (radiansToDegrees(Math.atan2(y, x)) + 360) % 360
}

// Assuming constant speed and direct path, calculate time to reach within X km of target
function calculateTimeToReach(
  flight: Flight,
  destinationPos: Location,
  targetPos: Location,
  radiusKm: number = 1 // Target radius in kilometers
): number | null {
  const planeSpeedKmh = knotsToKmh(flight.groundSpeed)

  // Calculate the distance and bearing from the plane to the target and to the destination
  const distanceToTarget = haversineDistance(
    { latitude: flight.latitude, longitude: flight.longitude },
    targetPos
  )

  // If the plane is already within the radius of the target, no time is needed
  if (distanceToTarget <= radiusKm) {
    return 0
  }

  const bearingToTarget = calculateBearing(
    { latitude: flight.latitude, longitude: flight.longitude },
    targetPos
  )
  const bearingToDestination = calculateBearing(
    { latitude: flight.latitude, longitude: flight.longitude },
    destinationPos
  )

  // Check if the target lies approximately on the path to the destination
  // This is a simplified check and might not be accurate for long distances due to the Earth's curvature
  if (Math.abs(bearingToTarget - bearingToDestination) > 10) {
    // 10 degrees tolerance
    return null // Target is not on the path
  }

  // Calculate the time to reach the target
  const timeToReachHours = distanceToTarget / planeSpeedKmh
  return timeToReachHours * 60 // Convert hours to minutes
}

export default calculateTimeToReach
