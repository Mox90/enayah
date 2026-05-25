import React from 'react'

const Dashboard = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Dashboard</h1>

        <p className='text-muted-foreground'>Welcome to Enayah HCM.</p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        <div className='rounded-2xl border bg-background p-6'>
          Total Employees
        </div>

        <div className='rounded-2xl border bg-background p-6'>
          Active Contracts
        </div>

        <div className='rounded-2xl border bg-background p-6'>Open Hiring</div>

        <div className='rounded-2xl border bg-background p-6'>Audit Logs</div>
      </div>
    </div>
  )
}

export default Dashboard
