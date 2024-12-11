import { flatten } from 'flat'
import type { RawFlight } from '../models/Response.ts'

// deno-lint-ignore no-explicit-any
const flattenObjectValues = (obj: Record<string, any>): any[] => {
  const flattenedObject = flatten(obj)
  return Object.values(flattenedObject)
}

const buildLogArray = (
  queryObject: Record<string, string>,
  rawFlight: RawFlight,
) => {
  return [
    new Date().toISOString(),
    ...flattenObjectValues(queryObject),
    ...flattenObjectValues(rawFlight),
  ]
}

const feetToMeters = (feet: number) => Math.round(feet * 0.3048)

const log = (message: string, user: string) => {
  Deno.writeTextFile(`logs/${user}.csv`, message, { append: true })
}

const formatString = (
  format: string,
  flight: RawFlight,
): string | undefined => {
  const flattenedFlight = flatten(flight)
  let placeholderFound = false

  const result = format.replace(/{(.*?)}/g, (_, key) => {
    const value = flattenedFlight[key]
    if (value !== undefined && value !== null) {
      placeholderFound = true
      return value
    }
    return 'N/A'
  })

  return placeholderFound ? result : undefined
}

export { buildLogArray, feetToMeters, formatString, log }
