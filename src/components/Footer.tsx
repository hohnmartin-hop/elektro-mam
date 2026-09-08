import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { Logo } from '@/components/Logo';

const footerLinks = [
  { to: '/', label: 'Úvod' },
  { to: '/projekty', label: 'Projekty' },
  { to: '/recepty', label: 'Recepty' },
  { to: '/o-mne', label: 'O mně' },
  { to: '/kontakt', label: 'Kontakt' },
];

export function Footer() {
  return (
    <footer className="no-print mt-20 border-t border-ink-500/40 bg-ink-900">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <Logo showText={true} />
            <p className="max-w-xs text-sm text-ink-200">
              Elektronika, bastlení, projekty a všechno kolem.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-300">
              Navigace
            </h3>
            <ul className="grid grid-cols-2 gap-2">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-200 transition-colors hover:text-accent-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-300">
              Kontakt
            </h3>
            <ul className="space-y-3 text-sm text-ink-200">
              <li>
                <a
                  href="mailto:Elektro-MaM@email.cz"
                  className="flex items-center gap-2 transition-colors hover:text-accent-400"
                >
                  <Mail className="h-4 w-4 text-accent-500" aria-hidden />
                  Elektro-MaM@email.cz
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-500" aria-hidden />
                Ostrava
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ink-500/30 pt-6">
          <p className="text-center text-xs text-ink-300">
            © 2026 Martin – Elektro MaM
          </p>
        </div>
      </div>
    </footer>
  );
}
