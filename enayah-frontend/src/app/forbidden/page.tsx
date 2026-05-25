import React from 'react'

const Forbidden = () => {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold'>403</h1>
        <p className='mt-2 text-muted-foreground'>
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  )
}

export default Forbidden
