import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CircuitBackground } from '@/components/CircuitBackground';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <CircuitBackground />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
