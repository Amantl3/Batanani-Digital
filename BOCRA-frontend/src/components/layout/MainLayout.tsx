import { Outlet } from 'react-router-dom'
import Navbar       from './Navbar'
import Footer       from './Footer'
import AlertBanner  from '@components/shared/AlertBanner'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AlertBanner />
      <Navbar />
      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
