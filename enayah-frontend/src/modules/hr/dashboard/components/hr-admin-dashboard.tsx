import StatsCard from '../widgets/stats-card'

const HRAdminDashboard = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>HR Administration Dashboard</h1>

        <p className='text-muted-foreground'>
          Human resources operations overview.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        <StatsCard title='Total Employees' value='1,245' />

        <StatsCard title='Open Hiring' value='24' />

        <StatsCard title='Expiring Contracts' value='12' />

        <StatsCard title='Employees on Leave' value='18' />
      </div>
    </div>
  )
}

export default HRAdminDashboard
