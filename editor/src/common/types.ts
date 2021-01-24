export interface Settings {
  controllerRows: number
  controllerColumns: number
  presets: Preset[]
}

export interface Preset {
  synthId: number
  channel: number
  mappings: ControllerMapping[]
}

export interface Synth {
  id: number
  slug: string
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
