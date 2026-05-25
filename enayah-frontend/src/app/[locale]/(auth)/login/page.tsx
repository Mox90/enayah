import React from 'react'
//import LoginForm from '@/components/auth/login-form'
import LoginForm from '@/modules/iam/components/auth/login-form'

const page = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
      <LoginForm />
    </div>
  )
}

export default page
