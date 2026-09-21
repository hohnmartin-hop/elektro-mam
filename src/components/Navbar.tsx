import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Wrench,
  BookOpen,
  Mail,
  User,
  MessageSquareHeart,
  Loader2,
  FileText,
  UtensilsCrossed,
} from 'lucide-react';
import { Logo } from './Logo';
import { supabase } from '@/lib/supabase';
import { projects as localProjects } from '@/data/projects';
import { recipes as localRecipes } from '@/data/recipes';

interface SearchResultItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'project' | 'recipe';
  url: string;
  category?: string;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Zavřít mobilní menu při změně stránky
  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Klávesová zkratka Ctrl+K / Cmd+K pro otevření vyhledávání
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofokus na vstup po otevření modalu
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Logika vyhledávání: Supabase + Fallback lokálních dat bez duplicit
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    const performSearch = async () => {
      try {
        // 1. Paralelní dotaz do Supabase
        const [projectsRes, recipesRes] = await Promise.allSettled([
          supabase
            .from('projects')
            .select('slug, title, shortDescription, description, category')
            .or(`title.ilike.%${query}%,shortDescription.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`),
          supabase
            .from('recipes')
            .select('slug, title, shortDescription, description, intro')
            .or(`title.ilike.%${query}%,shortDescription.ilike.%${query}%,description.ilike.%${query}%,intro.ilike.%${query}%`),
        ]);

        const remoteProjects =
          projectsRes.status === 'fulfilled' && projectsRes.value.data
            ? projectsRes.value.data
            : [];

        const remoteRecipes =
          recipesRes.status === 'fulfilled' && recipesRes.value.data
            ? recipesRes.value.data
            : [];

        // 2. Lokální data jako fallback pro vyhledávání
        const filteredLocalProjects = localProjects.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.shortDescription?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query)
        );

        const filteredLocalRecipes = localRecipes.filter(
          (r) =>
            r.title.toLowerCase().includes(query) ||
            r.shortDescription?.toLowerCase().includes(query) ||
            r.description?.toLowerCase().includes(query) ||
            r.intro?.toLowerCase().includes(query)
        );

        // 3. Sjednocení projektů (Supabase má přednost před lokálními, deduplikace dle slug)
        const projectsMap = new Map<string, SearchResultItem>();

        filteredLocalProjects.forEach((p) => {
          projectsMap.set(p.slug, {
            id: `p-${p.slug}`,
            slug: p.slug,
            title: p.title,
            description: p.shortDescription || p.description || '',
            type: 'project',
            url: `/projekty/${p.slug}`,
            category: p.category,
          });
        });

        remoteProjects.forEach((p: any) => {
          projectsMap.set(p.slug, {
            id: `p-${p.slug}`,
            slug: p.slug,
            title: p.title,
            description: p.shortDescription || p.description || '',
            type: 'project',
            url: `/projekty/${p.slug}`,
            category: p.category,
          });
        });

        // 4. Sjednocení receptů (Supabase má přednost před lokálními, deduplikace dle slug)
        const recipesMap = new Map<string, SearchResultItem>();

        filteredLocalRecipes.forEach((r) => {
          recipesMap.set(r.slug, {
            id: `r-${r.slug}`,
            slug: r.slug,
            title: r.title,
            description: r.shortDescription || r.description || r.intro || '',
            type: 'recipe',
            url: `/recepty/${r.slug}`,
          });
        });

        remoteRecipes.forEach((r: any) => {
          recipesMap.set(r.slug, {
            id: `r-${r.slug}`,
            slug: r.slug,
            title: r.title,
            description: r.shortDescription || r.description || r.intro || '',
            type: 'recipe',
            url: `/recepty/${r.slug}`,
          });
        });

        if (isMounted) {
          setSearchResults([
            ...Array.from(projectsMap.values()),
            ...Array.from(recipesMap.values()),
          ]);
        }
      } catch (err) {
        console.error('Chyba při vyhledávání v Supabase, použita lokální data:', err);
        // Bezpečný fallback při totálním selhání spojení
        if (isMounted) {
          const fallbackProjects: SearchResultItem[] = localProjects
            .filter((p) => p.title.toLowerCase().includes(query))
            .map((p) => ({
              id: `p-${p.slug}`,
              slug: p.slug,
              title: p.title,
              description: p.shortDescription || '',
              type: 'project',
              url: `/projekty/${p.slug}`,
              category: p.category,
            }));

          const fallbackRecipes: SearchResultItem[] = localRecipes
            .filter((r) => r.title.toLowerCase().includes(query))
            .map((r) => ({
              id: `r-${r.slug}`,
              slug: r.slug,
              title: r.title,
              description: r.shortDescription || '',
              type: 'recipe',
              url: `/recepty/${r.slug}`,
            }));

          setSearchResults([...fallbackProjects, ...fallbackRecipes]);
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    };

    const timer = setTimeout(performSearch, 200); // 200ms debounce
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSelectResult = (url: string) => {
    setSearchOpen(false);
    navigate(url);
  };

  const navLinks = [
    { to: '/projekty', label: 'Projekty', icon: Wrench },
    { to: '/recepty', label: 'Recepty', icon: BookOpen },
    { to: '/kniha-prani', label: 'Kniha přání a stížností', icon: MessageSquareHeart },
    { to: '/o-mne', label: 'O mně', icon: User },
    { to: '/kontakt', label: 'Kontakt', icon: Mail },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-ink-500/40 bg-ink-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>

          {/* Desktop navigace */}
          <nav className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-500/10 text-accent-400'
                      : 'text-ink-100 hover:bg-ink-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Tlačítka vpravo (Hledání + Mobilní menu) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-ink-500/40 bg-ink-800/40 px-3 py-2 text-xs text-ink-300 transition-colors hover:border-accent-500/40 hover:bg-ink-700/50 hover:text-white"
              title="Hledat na webu (Ctrl+K)"
            >
              <Search className="h-4 w-4 text-accent-400" />
              <span className="hidden sm:inline">Hledat...</span>
              <kbd className="hidden sm:inline-block rounded bg-ink-700 px-1.5 py-0.5 font-mono text-[10px] text-ink-300">
                Ctrl+K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-500/40 bg-ink-800/40 text-ink-200 transition-colors hover:bg-ink-700 md:hidden"
              aria-label="Přepnout menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobilní menu */}
        {isOpen && (
          <div className="border-b border-ink-500/40 bg-ink-900/95 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent-500/15 text-accent-400 font-semibold'
                        : 'text-ink-100 hover:bg-ink-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Vyhledávací modal (Ctrl+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 sm:pt-28 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-xl rounded-2xl border border-ink-500/60 bg-[#0f141c] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Vstupní pole vyhledávače */}
            <div className="relative flex items-center border-b border-ink-500/40 px-4">
              <Search className="h-5 w-5 text-accent-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hledej v projektech a receptech..."
                className="w-full bg-transparent px-3 py-4 text-sm text-white placeholder-ink-400 focus:outline-none"
              />
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded px-1.5 py-0.5 text-xs text-ink-400 hover:bg-ink-800 hover:text-white"
                >
                  ESC
                </button>
              )}
            </div>

            {/* Seznam výsledků */}
            <div className="max-h-80 overflow-y-auto p-2">
              {searchQuery.trim() === '' ? (
                <div className="py-8 text-center text-xs text-ink-400">
                  Zadej název nebo klíčové slovo projektu či receptu.
                </div>
              ) : searchResults.length === 0 && !isSearching ? (
                <div className="py-8 text-center text-xs text-ink-300">
                  Nebylo nic nalezeno pro výraz „<span className="text-white font-medium">{searchQuery}</span>“.
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectResult(item.url)}
                      className="group flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-ink-800/70"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink-500/30 bg-ink-800 text-accent-400 group-hover:border-accent-500/40">
                        {item.type === 'project' ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <UtensilsCrossed className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white group-hover:text-accent-400 truncate">
                            {item.title}
                          </span>
                          <span className="rounded bg-ink-800 px-1.5 py-0.5 text-[10px] font-medium text-ink-300">
                            {item.type === 'project' ? 'Projekt' : 'Recept'}
                          </span>
                          {item.category && (
                            <span className="hidden sm:inline-block text-[10px] text-ink-400 truncate">
                              • {item.category}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 text-xs text-ink-300 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Kliknutí do pozadí zavře modal */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setSearchOpen(false)}
          />
        </div>
      )}
    </>
  );
}