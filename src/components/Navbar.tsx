import { NavLink, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';

const navItems = [
  { to: '/', label: 'Úvod' },
  { to: '/projekty', label: 'Projekty' },
  { to: '/recepty', label: 'Recepty' },
  { to: '/o-mne', label: 'O mně' },
  { to: '/kontakt', label: 'Kontakt' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-ink-500/40 bg-ink-900/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop menu */}
        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-accent-400'
                      : 'text-ink-100 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent-500" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-ink-100 transition-colors hover:bg-ink-700 md:hidden"
          aria-label={open ? 'Zavřít menu' : 'Otevřít menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="animate-slide-down border-t border-ink-500/40 bg-ink-800 md:hidden">
          <ul className="mx-auto max-w-content space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-accent-500/10 text-accent-400'
                        : 'text-ink-100 hover:bg-ink-700'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
