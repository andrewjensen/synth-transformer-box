export interface Synth {
  id: string
  manufacturer: string
  title: string
  subtitle: string | null
  parameters: Parameter[]
}

export interface Parameter {
  cc: number
  title: string
}

export interface ControllerMapping {
  in: number
  out: number
}
