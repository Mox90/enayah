interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
}

const StatsCard = ({ title, value, subtitle }: StatsCardProps) => {
  return (
    <div className='rounded-2xl border bg-background p-6 shadow-sm'>
      <div className='space-y-2'>
        <p className='text-sm text-muted-foreground'>{title}</p>

        <h2 className='text-3xl font-bold'>{value}</h2>

        {subtitle && (
          <p className='text-xs text-muted-foreground'>{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export default StatsCard
