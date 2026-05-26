import StatsCard from '../widgets/stats-card'

const SystemAdminDashboard = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>System Administration Dashboard</h1>

        <p className='text-muted-foreground'>
          Infrastructure and platform monitoring.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        <StatsCard title='API Health' value='Healthy' />

        <StatsCard title='Active Sessions' value='128' />

        <StatsCard title='Failed Logins' value='3' />

        <StatsCard title='Database Status' value='Online' />
      </div>
    </div>
  )
}

export default SystemAdminDashboard
