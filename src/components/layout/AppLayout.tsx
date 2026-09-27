import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'
import { MobileNav } from './MobileNav'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      <TopHeader offsetClassName={collapsed ? 'left-20' : 'left-64'} />
      <MobileNav />
      <div className={`transition-all ${collapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 md:px-10 md:pb-8 md:pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
