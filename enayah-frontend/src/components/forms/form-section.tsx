import { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  children: ReactNode
}

export function FormSection({ title, description, children }: Props) {
  return (
    <div className='space-y-4 rounded-xl border p-6'>
      <div>
        <h2 className='text-lg font-semibold'>{title}</h2>

        {description && (
          <p className='text-sm text-muted-foreground'>{description}</p>
        )}
      </div>

      {children}
    </div>
  )
}
