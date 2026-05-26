import StatsCard from '../widgets/stats-card'

const ManagerDashboard = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Manager Dashboard</h1>

        <p className='text-muted-foreground'>Team overview and approvals.</p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        <StatsCard title='Team Attendance' value='93%' />

        <StatsCard title='Pending Leaves' value='8' />

        <StatsCard title='Performance Reviews' value='5' />

        <StatsCard title='Open Tasks' value='12' />
      </div>
    </div>
  )
}

export default ManagerDashboard
