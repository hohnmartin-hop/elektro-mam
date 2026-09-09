import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Tlačítko se zobrazí po odscrollování o 300px dolů
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Zpět nahoru"
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-accent-500/40 bg-ink-800/80 text-accent-400 shadow-lg backdrop-blur transition-all duration-200 hover:border-accent-400 hover:bg-ink-700 hover:text-accent-300 focus:outline-none"
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  );
}