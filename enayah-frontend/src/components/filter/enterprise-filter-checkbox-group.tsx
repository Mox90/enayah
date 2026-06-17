'use client'

import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  values: string[]
  options: {
    value: string
    label: string
  }[]

  onChange: (values: string[]) => void
}

export function EnterpriseFilterCheckboxGroup({
  values,

  options,

  onChange,
}: Props) {
  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((x) => x !== value))
    } else {
      onChange([...values, value])
    }
  }

  return (
    <div className='space-y-2'>
      {options.map((option) => (
        <div key={option.value} className='flex items-center gap-2'>
          <Checkbox
            checked={values.includes(option.value)}
            onCheckedChange={() => toggle(option.value)}
          />

          <span>{option.label}</span>
        </div>
      ))}
    </div>
  )
}
