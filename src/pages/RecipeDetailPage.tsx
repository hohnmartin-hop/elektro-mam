import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Printer,
  ListOrdered,
  ChefHat,
  StickyNote,
} from 'lucide-react';
import { Seo } from '@/components/Seo';
import { recipes as localRecipes } from '@/data/recipes';
import { RecipeComments } from '@/components/RecipeComments';
import { supabase } from '../supabase';
import { Recipe } from '../types';

export function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadRecipe() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('Chyba při načítání ze Supabase:', error.message);
        }

        if (data) {
          setRecipe(data as Recipe);
        } else {
          const local = localRecipes.find((r) => r.slug === slug);
          if (local) {
            setRecipe(local);
          } else {
            setNotFound(true);
          }
        }
      } catch (err) {
        console.error('Neočekávaná chyba při načítání receptu:', err);
        const local = localRecipes.find((r) => r.slug === slug);
        if (local) {
          setRecipe(local);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [slug]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-content px-4 py-24 text-center text-ink-300">
        <p className="text-sm">Načítám recept...</p>
      </div>
    );
  }

  if (notFound || !recipe) {
    return <Navigate to="/recepty" replace />;
  }

  return (
    <>
      <Seo
        title={`${recipe.title} – Recept – Elektro MaM`}
        description={recipe.shortDescription}
      />

      <article className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        {/* Back link — hidden in print */}
        <Link
          to="/recepty"
          className="no-print mb-6 inline-flex items-center gap-2 text-sm text-ink-200 transition-colors hover:text-accent-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Zpět na recepty
        </Link>

        {/* Header */}
        <div className="no-print mb-6 flex flex-wrap items-center gap-3">
          <span className="chip border-circuit-amber/40 bg-circuit-amber/10 text-circuit-amber">
            Recept
          </span>
          <span className="flex items-center gap-1.5 text-xs text-ink-300">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {new Date(recipe.date).toLocaleDateString('cs-CZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="print-recipe">
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{recipe.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-ink-100">{recipe.shortDescription}</p>

          {/* Print button — hidden in print */}
          <button
            type="button"
            onClick={handlePrint}
            className="no-print mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-circuit-amber/40 bg-circuit-amber/10 px-6 py-3 text-sm font-semibold text-circuit-amber transition-all duration-200 hover:bg-circuit-amber/20 active:scale-[0.98]"
          >
            <Printer className="h-5 w-5" aria-hidden />
            Vytisknout recept
          </button>

          {/* Meta info */}
          <div className="no-print mt-6 flex flex-wrap gap-4">
            {recipe.prepTime && (
              <div className="flex items-center gap-2 rounded-lg border border-ink-500/60 bg-ink-700/40 px-4 py-2 text-sm text-ink-200">
                <Clock className="h-4 w-4 text-accent-400" aria-hidden />
                {recipe.prepTime}
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2 rounded-lg border border-ink-500/60 bg-ink-700/40 px-4 py-2 text-sm text-ink-200">
                <Users className="h-4 w-4 text-accent-400" aria-hidden />
                {recipe.servings}
              </div>
            )}
          </div>

          {/* Hero image */}
          <div className="no-print mt-8 overflow-hidden rounded-2xl border border-ink-500/60">
            <img
              src={recipe.image}
              alt={recipe.imageAlt || recipe.title}
              className="w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Intro */}
          <section className="mt-8 rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6">
            <div className="mb-3 flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-circuit-amber" aria-hidden />
              <h2 className="text-xl font-semibold text-white">Úvod</h2>
            </div>
            <p className="text-ink-100 leading-relaxed">{recipe.intro}</p>
          </section>

          {/* Content grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Ingredients */}
            <section className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6 lg:col-span-1">
              <h2 className="mb-4 text-lg font-semibold text-white">Ingredience</h2>
              <ul className="space-y-2">
                {recipe.ingredients?.map((ing, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between border-b border-ink-500/30 pb-2 text-sm last:border-0"
                  >
                    <span className="text-ink-100">{ing.name}</span>
                    <span className="font-mono text-xs text-accent-400">{ing.amount}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Steps */}
            <section className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6 lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <ListOrdered className="h-5 w-5 text-circuit-amber" aria-hidden />
                <h2 className="text-lg font-semibold text-white">Postup</h2>
              </div>
              <ol className="space-y-4">
                {recipe.steps?.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-circuit-amber/40 bg-circuit-amber/10 font-mono text-sm font-bold text-circuit-amber">
                      {i + 1}
                    </span>
                    <p className="flex-1 pt-1 text-sm text-ink-100 leading-relaxed">{step.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Notes */}
          {recipe.notes && (
            <section className="no-print mt-8 rounded-2xl border border-circuit-amber/30 bg-circuit-amber/5 p-6">
              <div className="mb-3 flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-circuit-amber" aria-hidden />
                <h2 className="text-xl font-semibold text-white">Poznámky</h2>
              </div>
              <p className="text-ink-100 leading-relaxed">{recipe.notes}</p>
            </section>
          )}
        </div>

        {/* Komentáře k receptu — při tisku skryté */}
        <div className="no-print">
          <RecipeComments recipeSlug={recipe.slug} />
        </div>
      </article>
    </>
  );
}