import StatsCard from '../widgets/stats-card'

const EmployeeDashboard = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Employee Dashboard</h1>

        <p className='text-muted-foreground'>Welcome to your workspace.</p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        <StatsCard title='Attendance Today' value='Present' />

        <StatsCard title='Leave Balance' value='18 Days' />

        <StatsCard title='Upcoming Trainings' value='2' />

        <StatsCard title='Pending Tasks' value='4' />
      </div>
    </div>
  )
}

export default EmployeeDashboard
