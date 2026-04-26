export interface HeadcountRow {
  [key: string]: any
  values: number[]
}

export interface HeadcountResponse {
  dimensions: string[]
  years: number[]
  data: HeadcountRow[]
}
