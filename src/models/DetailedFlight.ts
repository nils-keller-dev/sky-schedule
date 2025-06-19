export interface DetailedFlight {
  identification: {
    id: string
    callsign: string
  }
  aircraft?: {
    model?: {
      text: string
    }
  }
  airline?: {
    name: string
    code: string | null
  }
  airport: {
    origin: DetailedFlightAirport | null
    destination: DetailedFlightAirport | null
  }
  trail: {
    alt: number
  }[]
}

interface DetailedFlightAirport {
  code: {
    iata: string
  }
  position: {
    country: {
      code: string
    }
  }
}
