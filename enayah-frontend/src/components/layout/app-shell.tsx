import { ReactNode } from 'react'
import Sidebar from './sidebar'
import Topbar from './topbar'

const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar />

      <div className='flex flex-1 flex-col overflow-hidden'>
        <Topbar />

        <main className='flex-1 overflow-auto bg-muted/20 p-6'>{children}</main>
      </div>
    </div>
  )
}

export default AppShell
