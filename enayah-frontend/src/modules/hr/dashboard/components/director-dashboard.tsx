import StatsCard from '../widgets/stats-card'

const DirectorDashboard = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Executive Dashboard</h1>

        <p className='text-muted-foreground'>Strategic workforce analytics.</p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        <StatsCard title='Turnover Rate' value='12%' />

        <StatsCard title='Hiring Growth' value='+18%' />

        <StatsCard title='Budget Utilization' value='84%' />

        <StatsCard title='Department KPIs' value='92%' />
      </div>
    </div>
  )
}

export default DirectorDashboard
