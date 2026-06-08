'use client'

import { EnterpriseFilterCheckboxGroup } from './enterprise-filter-checkbox-group'
import { EnterpriseFilterLookup } from './enterprise-filter-lookup'

//import { EnterpriseFilterLookup } from './enterprise-filter-lookup'

import { EnterpriseFilterConfig } from './enterprise-filter-types'

interface Props {
  config: EnterpriseFilterConfig

  values: string[]

  onChange: (values: string[]) => void
}

export function EnterpriseFilterGroup({
  config,

  values,

  onChange,
}: Props) {
  return (
    <div className='space-y-3'>
      <h3 className='font-semibold'>{config.label}</h3>

      {config.type === 'lookup' ? (
        <EnterpriseFilterLookup
          endpoint={config.endpoint ?? ''}
          valueField={config.valueField ?? 'id'}
          labelField={config.labelField ?? 'name'}
          value={values}
          onChange={onChange}
        />
      ) : (
        <EnterpriseFilterCheckboxGroup
          values={values}
          options={config.options ?? []}
          onChange={onChange}
        />
      )}
    </div>
  )
}
