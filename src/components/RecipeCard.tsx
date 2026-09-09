import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import type { Recipe } from '@/types';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to={`/recepty/${recipe.slug}`}
      className="card group flex flex-col overflow-hidden animate-fade-in-up"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
        <span className="chip absolute left-3 top-3 border-circuit-amber/40 bg-circuit-amber/10 text-circuit-amber">
          Recept
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-accent-400">
          {recipe.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-ink-200">
          {recipe.shortDescription}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-ink-300">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {new Date(recipe.date).toLocaleDateString('cs-CZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-accent-400 transition-transform group-hover:translate-x-1">
            Recept
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}