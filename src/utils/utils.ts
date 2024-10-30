import type { Response } from '../models/Response.ts'

const buildLogArray = (
  queryObject: Record<string, string>,
  responseObject: Response,
) => {
  return [
    new Date().toISOString(),
    queryObject.location,
    responseObject.altitude,
    responseObject.distance,
    responseObject.origin?.city,
    responseObject.origin?.country,
    responseObject.destination?.city,
    responseObject.destination?.country,
    responseObject.aircraft,
    responseObject.airline,
  ]
}

const feetToMeters = (feet: number) => Math.round(feet * 0.3048)

const getFromJson = (key: string, json: Record<string, string>) => {
  return json[key] ?? key
}

const log = (message: string, user: string) => {
  Deno.writeTextFile(`logs/${user}.csv`, message, { append: true })
}

export { buildLogArray, feetToMeters, getFromJson, log }
