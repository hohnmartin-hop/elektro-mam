import { useState, useMemo, useEffect } from 'react';
import { ChefHat } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { RecipeCard } from '@/components/RecipeCard';
import { recipes as initialRecipes } from '@/data/recipes';
import { supabase } from '@/supabase';
import type { Recipe } from '@/types';

export function RecipesPage() {
  const [recipeList, setRecipeList] = useState<Recipe[]>(initialRecipes);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Chyba při stahování receptů ze Supabase:', error.message);
          return;
        }

        if (data && data.length > 0) {
          setRecipeList(data as Recipe[]);
        }
      } catch (err) {
        console.error('Neočekávaná chyba při načítání receptů:', err);
      }
    }

    fetchRecipes();
  }, []);

  const sorted = useMemo(() => {
    return [...recipeList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [recipeList]);

  return (
    <>
      <Seo
        title="Recepty – Elektro MaM"
        description="Domácí recepty – česneková sůl, uzené klobásky, rybí speciality a další z dílny i od vody."
      />

      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-circuit-amber/40 bg-circuit-amber/10">
            <ChefHat className="h-6 w-6 text-circuit-amber" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Recepty</h1>
            <p className="mt-1 text-ink-200">
              Když se nepájím, tak vařím. Tady jsou moje osvědčené recepty.
            </p>
          </div>
        </div>

        {sorted.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-12 text-center">
            <p className="text-ink-200">Zatím tu nejsou žádné recepty.</p>
          </div>
        )}
      </section>
    </>
  );
}
