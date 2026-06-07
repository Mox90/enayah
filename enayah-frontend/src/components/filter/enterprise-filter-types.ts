export interface EnterpriseFilterOption {
  value: string
  label: string
}

export interface EnterpriseFilterConfig {
  key: string
  label: string
  type: 'checkbox' | 'lookup'
  options?: EnterpriseFilterOption[]
  endpoint?: string
  valueField?: string
  labelField?: string
}
