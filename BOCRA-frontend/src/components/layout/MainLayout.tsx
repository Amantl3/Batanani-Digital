import { Outlet, useLocation } from 'react-router-dom'
import Navbar      from './Navbar'
import Footer      from './Footer'
import AlertBanner from '@components/shared/AlertBanner'

export default function MainLayout() {
  const { pathname } = useLocation()

  // HomePage has its own built-in footer — don't render the layout footer on /
  const showLayoutFooter = pathname !== '/'

  return (
    <div className="flex min-h-screen flex-col">
      <AlertBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {showLayoutFooter && <Footer />}
    </div>
  )
}