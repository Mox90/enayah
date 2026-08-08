// enayah-front/src/app/[locale]/(auth)/layout.tsx

import React from 'react'

type AuthLayoutPage = {
  children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutPage) => {
  return (
    //<div className='flex min-h-screen items-center justify-center bg-muted/20'>
    <div>{children}</div>
  )
}

export default AuthLayout
