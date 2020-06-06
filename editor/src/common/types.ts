export interface Settings {
  presets: Preset[]
}

export interface Preset {
  synthId: string
  channel: number
  mappings: ControllerMapping[]
}

export interface Synth {
  // TODO: split id (number) and slug (string)
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
