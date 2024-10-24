const feetToMeters = (feet: number) => Math.round(feet * 0.3048)

const getFromJson = (key: string, json: Record<string, string>) => {
  return json[key] ?? key
}

export { feetToMeters, getFromJson }
