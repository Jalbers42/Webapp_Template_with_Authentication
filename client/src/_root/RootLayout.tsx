import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  return (
    <div className="w-full md:flex">
        {/* <Topbar />
        <Sidebar /> */}
        <Outlet />
    </div>
  )
}

export default RootLayout