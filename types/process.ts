export interface Process {
  id: string
  name: string
  sei: string
  responsible: string
  type: string
  modal?: string
  arrivalDate: string
  exitDate: string | null
  observations?: string
  authorized?: string
}

