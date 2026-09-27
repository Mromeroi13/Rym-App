import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      <TopHeader offsetClassName={collapsed ? 'left-20' : 'left-64'} />
      <div className={`transition-all ${collapsed ? 'pl-20' : 'pl-64'}`}>
        <main className="mx-auto max-w-6xl px-6 py-8 pt-24 md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
