import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Recipe, RecipeIngredient, RecipeStep } from '../../types';
import { Plus, Trash2, Edit3, X, Check, ChefHat, RefreshCw } from 'lucide-react';

export const AdminRecipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialFormState: Recipe = {
    slug: '',
    title: '',
    shortDescription: '',
    image: '',
    imageAlt: '',
    date: new Date().toISOString().split('T')[0],
    intro: '',
    ingredients: [{ name: '', amount: '' }],
    steps: [{ body: '' }],
    notes: '',
    servings: '',
    prepTime: ''
  };

  const [formData, setFormData] = useState<Recipe>(initialFormState);
  const [isNewRecipe, setIsNewRecipe] = useState(true);

  const fetchRecipes = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Chyba při načítání receptů.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleCreateNew = () => {
    setFormData({
      ...initialFormState,
      date: new Date().toISOString().split('T')[0]
    });
    setIsNewRecipe(true);
    setIsEditing(true);
  };

  const handleEdit = (recipe: Recipe) => {
    setFormData({
      ...recipe,
      ingredients: recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', amount: '' }],
      steps: recipe.steps && recipe.steps.length > 0 ? recipe.steps : [{ body: '' }],
      notes: recipe.notes || '',
      servings: recipe.servings || '',
      prepTime: recipe.prepTime || ''
    });
    setIsNewRecipe(false);
    setIsEditing(true);
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm(`Opravdu chceš smazat recept se slugem "${slug}"?`)) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('slug', slug);

      if (error) throw error;
      setRecipes(prev => prev.filter(r => r.slug !== slug));
    } catch (err: any) {
      alert('Chyba při mazání: ' + err.message);
    }
  };

  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: string) => {
    const updated = [...formData.ingredients];
    updated[index][field] = value;
    setFormData({ ...formData, ingredients: updated });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', amount: '' }]
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const handleStepChange = (index: number, value: string) => {
    const updated = [...formData.steps];
    updated[index].body = value;
    setFormData({ ...formData, steps: updated });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { body: '' }]
    });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Recipe = {
      ...formData,
      slug: formData.slug.trim(),
      title: formData.title.trim(),
      ingredients: formData.ingredients.filter(ing => ing.name.trim() !== ''),
      steps: formData.steps.filter(step => step.body.trim() !== '')
    };

    if (!payload.slug || !payload.title) {
      alert('Pole Slug a Název receptu jsou povinné.');
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('recipes')
        .upsert(payload);

      if (error) throw error;

      setIsEditing(false);
      fetchRecipes();
    } catch (err: any) {
      alert('Chyba při ukládání: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-500" />
            Správa receptů
          </h2>
          <p className="text-sm text-neutral-400">Přidávání, úprava a mazání receptů v databázi Supabase</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecipes}
            disabled={loading}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
            title="Aktualizovat seznam"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {!isEditing && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-semibold hover:bg-amber-400 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Přidat recept
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit} className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h3 className="text-lg font-semibold text-white">
              {isNewRecipe ? 'Nový recept' : `Úprava: ${formData.title}`}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Slug (URL identifikátor) *
              </label>
              <input
                type="text"
                required
                disabled={!isNewRecipe}
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="např. klobasy-domaci"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Název receptu *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="např. Domácí klobásy"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Krátký popis *
            </label>
            <input
              type="text"
              required
              value={formData.shortDescription}
              onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                URL obrázku *
              </label>
              <input
                type="text"
                required
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Popisek obrázku (ALT) *
              </label>
              <input
                type="text"
                required
                value={formData.imageAlt}
                onChange={e => setFormData({ ...formData, imageAlt: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Datum *
              </label>
              <input
                type="text"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Doba přípravy
              </label>
              <input
                type="text"
                value={formData.prepTime || ''}
                onChange={e => setFormData({ ...formData, prepTime: e.target.value })}
                placeholder="např. 1 hodina"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Počet porcí
              </label>
              <input
                type="text"
                value={formData.servings || ''}
                onChange={e => setFormData({ ...formData, servings: e.target.value })}
                placeholder="např. 4 osoby"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Úvodní text (Intro) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.intro}
              onChange={e => setFormData({ ...formData, intro: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none resize-y"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Suroviny
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Přidat surovinu
              </button>
            </div>
            <div className="space-y-2">
              {formData.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Název suroviny"
                    value={ing.name}
                    onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Množství"
                    value={ing.amount}
                    onChange={e => handleIngredientChange(idx, 'amount', e.target.value)}
                    className="w-32 sm:w-40 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(idx)}
                    disabled={formData.ingredients.length <= 1}
                    className="p-2 rounded-lg text-neutral-500 hover:text-red-400 transition disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Postup přípravy (kroky)
              </label>
              <button
                type="button"
                onClick={addStep}
                className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Přidat krok
              </button>
            </div>
            <div className="space-y-2">
              {formData.steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="pt-2 text-xs font-bold text-neutral-500 w-6 text-center">{idx + 1}.</span>
                  <textarea
                    rows={2}
                    placeholder={`Popis ${idx + 1}. kroku...`}
                    value={step.body}
                    onChange={e => handleStepChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none resize-y"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    disabled={formData.steps.length <= 1}
                    className="p-2 rounded-lg text-neutral-500 hover:text-red-400 transition disabled:opacity-30 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Poznámky / Tipy (volitelné)
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-sm transition"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Ukládám...' : 'Uložit recept'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-8 text-center text-neutral-500 text-sm">Načítám recepty ze Supabase...</div>
      ) : recipes.length === 0 ? (
        <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 text-sm">
          V databázi zatím nejsou žádné recepty.
        </div>
      ) : (
        <div className="grid gap-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.slug}
              className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-base">{recipe.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono">
                    /{recipe.slug}
                  </span>
                </div>
                <p className="text-sm text-neutral-400">{recipe.shortDescription}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-500 pt-1">
                  <span>Suroviny: {recipe.ingredients?.length || 0}</span>
                  <span>Kroky: {recipe.steps?.length || 0}</span>
                  {recipe.prepTime && <span>Čas: {recipe.prepTime}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleEdit(recipe)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Upravit
                </button>
                <button
                  onClick={() => handleDelete(recipe.slug)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Smazat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
