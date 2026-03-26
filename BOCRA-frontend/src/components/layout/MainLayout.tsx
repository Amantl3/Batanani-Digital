// src/layouts/MainLayout.tsx
import { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AlertBanner from '@components/shared/AlertBanner';
import WhatsAppFloatingIcon from '@components/WhatsAppFloatingIcon';

interface MainLayoutProps {
  children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { pathname } = useLocation();
  const showLayoutFooter = pathname !== '/';

  // Your WhatsApp number (Twilio sandbox or your own)
  const whatsappNumber = '+14155238886'; // replace with your number if needed

  return (
    <div className="flex min-h-screen flex-col">
      <AlertBanner />
      <Navbar />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      {showLayoutFooter && <Footer />}

      {/* Floating WhatsApp Icon */}
      <WhatsAppFloatingIcon number={whatsappNumber} />
    </div>
  );
}