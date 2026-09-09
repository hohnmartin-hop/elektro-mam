import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { projects } from '@/data/projects';
import { recipes } from '@/data/recipes';

const navItems = [
  { to: '/', label: 'Úvod' },
  { to: '/projekty', label: 'Projekty' },
  { to: '/recepty', label: 'Recepty' },
  { to: '/o-mne', label: 'O mně' },
  { to: '/kontakt', label: 'Kontakt' },
];

interface SearchResult {
  title: string;
  slug: string;
  type: 'Projekt' | 'Recept';
  url: string;
  snippet: string;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Vyhledávací logika v projektech i receptech
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const matchedProjects: SearchResult[] = projects
      .filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const shortMatch = p.shortDescription?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        return titleMatch || shortMatch || descMatch;
      })
      .map((p) => ({
        title: p.title,
        slug: p.slug,
        type: 'Projekt',
        url: `/projekty/${p.slug}`,
        snippet: p.shortDescription || '',
      }));

    const matchedRecipes: SearchResult[] = recipes
      .filter((r) => {
        const titleMatch = r.title.toLowerCase().includes(q);
        const shortMatch = r.shortDescription?.toLowerCase().includes(q);
        const introMatch = r.intro?.toLowerCase().includes(q);
        return titleMatch || shortMatch || introMatch;
      })
      .map((r) => ({
        title: r.title,
        slug: r.slug,
        type: 'Recept',
        url: `/recepty/${r.slug}`,
        snippet: r.shortDescription || '',
      }));

    setResults([...matchedProjects, ...matchedRecipes]);
    setShowResults(true);
  }, [query]);

  // Zavření našeptávače při kliknutí mimo vyhledávač
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (url: string) => {
    setShowResults(false);
    setQuery('');
    setOpen(false);
    navigate(url);
  };

  return (
    <header className="no-print sticky top-0 z-50 border-b border-ink-500/40 bg-ink-900/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop menu a vyhledávání */}
        <div className="hidden items-center gap-4 md:flex">
          <ul className="flex items-center gap-1">
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

          {/* Vyhledávací pole desktop */}
          <div ref={searchRef} className="relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim().length >= 2 && setShowResults(true)}
                placeholder="Hledat..."
                className="w-44 rounded-lg border border-ink-500/50 bg-ink-800/80 py-1.5 pl-8 pr-3 text-xs text-white placeholder-ink-400 transition-all focus:w-60 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
              />
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-ink-400" />
            </div>

            {/* Okno s výsledky */}
            {showResults && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-ink-500/50 bg-ink-800 p-2 shadow-2xl">
                {results.length > 0 ? (
                  <ul className="divide-y divide-ink-700/60">
                    {results.map((res) => (
                      <li key={`${res.type}-${res.slug}`}>
                        <button
                          type="button"
                          onClick={() => handleSelectResult(res.url)}
                          className="w-full rounded-md p-2 text-left transition-colors hover:bg-ink-700"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{res.title}</span>
                            <span className="rounded bg-ink-900 px-1.5 py-0.5 text-[10px] font-bold text-accent-400">
                              {res.type}
                            </span>
                          </div>
                          {res.snippet && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-ink-300">
                              {res.snippet}
                            </p>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-center text-xs text-ink-400">
                    Žádné výsledky pro výraz „{query}“
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobilní tlačítko */}
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

      {/* Mobilní menu */}
      {open && (
        <div className="border-t border-ink-500/40 bg-ink-800 md:hidden">
          <div className="px-4 pt-3">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hledat na webu..."
                className="w-full rounded-lg border border-ink-500/50 bg-ink-900 py-2 pl-9 pr-3 text-sm text-white placeholder-ink-400 focus:border-accent-400 focus:outline-none"
              />
              <Search className="absolute left-3 h-4 w-4 text-ink-400" />
            </div>

            {query.trim().length >= 2 && (
              <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-ink-500/40 bg-ink-900 p-2">
                {results.length > 0 ? (
                  <ul className="divide-y divide-ink-700/60">
                    {results.map((res) => (
                      <li key={`m-${res.type}-${res.slug}`}>
                        <button
                          type="button"
                          onClick={() => handleSelectResult(res.url)}
                          className="w-full p-2 text-left text-sm text-white hover:bg-ink-800"
                        >
                          <div className="flex items-center justify-between">
                            <span>{res.title}</span>
                            <span className="text-[10px] text-accent-400">{res.type}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-2 text-center text-xs text-ink-400">Žádné výsledky</div>
                )}
              </div>
            )}
          </div>

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