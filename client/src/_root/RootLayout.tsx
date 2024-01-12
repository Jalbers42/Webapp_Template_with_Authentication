import Sidebar from '@/components/shared/Sidebar'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  return (
    <div className="w-full flex items-center">
        {/* <Topbar /> */}
        <Sidebar />
        <Outlet />
    </div>
  )
}

export default RootLayout