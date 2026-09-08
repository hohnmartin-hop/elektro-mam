import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { Seo } from '@/components/Seo';

export function NotFoundPage() {
  return (
    <>
      <Seo title="404 – Elektro MaM" description="Stránka nebyla nalezena." />
      <section className="mx-auto flex max-w-content flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-circuit-amber/40 bg-circuit-amber/10">
          <AlertTriangle className="h-10 w-10 text-circuit-amber" aria-hidden />
        </div>
        <h1 className="mt-8 text-5xl font-bold text-white sm:text-6xl">404</h1>
        <p className="mt-4 max-w-md text-ink-100">
          Tato stránka se ztratila někde v drátech plošného spoje. Zkus se vrátit na hlavní
          stránku.
        </p>
        <Link to="/" className="btn-primary mt-8">
          <Home className="h-4 w-4" aria-hidden />
          Zpět na úvod
        </Link>
      </section>
    </>
  );
}
