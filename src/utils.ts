const feetToMeters = (feet: number) => Math.round(feet * 0.3048)

const getFromJson = (key: string, json: Record<string, string>) => {
  return json[key] ?? key
}

const removeAccents = <T extends string | undefined>(str: T): T => {
  if (!str) return str
  const withoutUmlauts = str
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('Ä', 'Ae')
    .replaceAll('Ö', 'Oe')
    .replaceAll('Ü', 'Ue')
  return withoutUmlauts.normalize('NFD').replace(/[\u0300-\u036f]/g, '') as T
}

export { feetToMeters, getFromJson, removeAccents }
