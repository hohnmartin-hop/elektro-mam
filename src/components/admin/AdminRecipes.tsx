import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Recipe, RecipeIngredient, RecipeStep } from '../../types';
import { Plus, Trash2, Edit3, X, Check, ChefHat, RefreshCw, Image, FileText } from 'lucide-react';
import { ImageSelectorModal } from './ImageSelectorModal';
import { parseProjectDocx } from '../../utils/docxParser';

export const AdminRecipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isImportingDocx, setIsImportingDocx] = useState(false);

  const initialFormState: Recipe = {
    slug: '',
    title: '',
    shortDescription: '',
    image: '',
    imageAlt: '',
    date: new Date().toISOString().split('T')[0],
    intro: '',
    description: '',
    ingredients: [{ name: '', amount: '' }],
    steps: [{ body: '' }],
    notes: '',
    servings: '',
    prepTime: '',
  };

  const [formData, setFormData] = useState<Recipe>(initialFormState);

  const fetchRecipes = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setRecipes(data || []);
      }
    } catch {
      setErrorMsg('Chyba při stahování receptů.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDocxImport = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      alert('Vyber prosím soubor typu Word (.docx).');
      return;
    }

    setIsImportingDocx(true);
    try {
      const parsed = await parseProjectDocx(file);
      setFormData(prev => ({
        ...prev,
        title: parsed.title || prev.title,
        slug: parsed.slug || prev.slug,
        shortDescription: parsed.shortDescription || prev.shortDescription,
        description: parsed.description || prev.description,
        image: parsed.imageBase64 || prev.image,
        imageAlt: parsed.title || prev.imageAlt,
      }));
    } catch (err: any) {
      alert('Chyba při zpracování Word souboru: ' + err.message);
    } finally {
      setIsImportingDocx(false);
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setFormData({
      ...initialFormState,
      ...recipe,
      description: recipe.description || '',
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Opravdu chceš smazat tento recept?')) return;

    try {
      const { error } = await supabase.from('recipes').delete().eq('slug', slug);
      if (error) {
        alert('Chyba při mazání: ' + error.message);
      } else {
        setRecipes(recipes.filter(r => r.slug !== slug));
        if (formData.slug === slug) handleCancel();
      }
    } catch (err: any) {
      alert('Chyba: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('recipes')
          .update(formData)
          .eq('slug', formData.slug);

        if (error) throw error;

        setRecipes(recipes.map(r => (r.slug === formData.slug ? formData : r)));
        setIsEditing(false);
      } else {
        const { error } = await supabase.from('recipes').insert([formData]);
        if (error) throw error;

        setRecipes([formData, ...recipes]);
      }
      setFormData(initialFormState);
    } catch (err: any) {
      alert('Chyba při ukládání: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', amount: '' }],
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string) => {
    const updated = [...formData.ingredients];
    updated[index][field] = value;
    setFormData({ ...formData, ingredients: updated });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { body: '' }],
    });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...formData.steps];
    updated[index].body = value;
    setFormData({ ...formData, steps: updated });
  };

  return (
    <div className="space-y-12">
      {/* Formulář */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ChefHat className="text-amber-500" />
            {isEditing ? 'Upravit recept' : 'Přidat nový recept'}
          </h2>
          {isEditing && (
            <button
              onClick={handleCancel}
              className="text-sm text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <X size={16} /> Zrušit úpravy
            </button>
          )}
        </div>

        {/* Rychlý import z Wordu (.docx) */}
        <div className="mb-6 p-5 rounded-2xl bg-neutral-950 border-2 border-dashed border-neutral-800 hover:border-amber-500/60 transition-colors text-center">
          <input
            type="file"
            id="recipe-docx-upload"
            accept=".docx"
            className="hidden"
            disabled={isImportingDocx}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleDocxImport(file);
              e.target.value = '';
            }}
          />
          <label
            htmlFor="recipe-docx-upload"
            className="cursor-pointer flex flex-col items-center justify-center gap-2 text-neutral-300 hover:text-white"
          >
            <FileText className="w-8 h-8 text-amber-500" />
            <span className="font-semibold text-sm text-amber-400">
              {isImportingDocx ? '⏳ Načítám data z Wordu...' : '📄 Klikni zde pro načtení receptu z Wordu (.docx)'}
            </span>
            <span className="text-xs text-neutral-500">
              Automaticky předvyplní název, slug, popis a vloží formátovaný text s fotkami
            </span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Slug (URL identifikátor) *
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="napr-cesnekova-sul"
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
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Krátký popis (pro karty) *
            </label>
            <textarea
              required
              rows={2}
              value={formData.shortDescription}
              onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  URL obrázku *
                </label>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  <Image size={14} />
                  Vybrat z nahraných fotek
                </button>
              </div>
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
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
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
                placeholder="např. 4 porce"
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
                placeholder="např. 45 minut"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Úvodní text
            </label>
            <textarea
              rows={3}
              value={formData.intro || ''}
              onChange={e => setFormData({ ...formData, intro: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
            />
          </div>

          {/* Podrobný popis / HTML z Wordu */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Podrobný popis / obsah z Wordu (HTML)
            </label>
            <textarea
              rows={6}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Obsah se automaticky vyplní po načtení souboru .docx nebo ho sem můžeš vložit ručně..."
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none font-mono text-xs"
            />
          </div>

          {/* Suroviny */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Suroviny
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1"
              >
                <Plus size={14} /> Přidat surovinu
              </button>
            </div>
            <div className="space-y-2">
              {formData.ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Název suroviny"
                    value={ing.name}
                    onChange={e => updateIngredient(index, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Množství"
                    value={ing.amount}
                    onChange={e => updateIngredient(index, 'amount', e.target.value)}
                    className="w-32 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-neutral-500 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Postup */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Postup přípravy
              </label>
              <button
                type="button"
                onClick={addStep}
                className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1"
              >
                <Plus size={14} /> Přidat krok
              </button>
            </div>
            <div className="space-y-2">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <span className="py-2 text-sm text-neutral-500 w-6 text-right">
                    {index + 1}.
                  </span>
                  <textarea
                    rows={2}
                    placeholder="Popis kroku"
                    value={step.body}
                    onChange={e => updateStep(index, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
                  />
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-2 text-neutral-500 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Poznámky / tipy na závěr
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold transition-colors"
              >
                Zrušit
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Check size={18} />
              {saving ? 'Ukládám...' : isEditing ? 'Uložit změny' : 'Přidat recept'}
            </button>
          </div>
        </form>
      </div>

      {/* Seznam existujících receptů */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Všechny recepty ({recipes.length})</h3>
          <button
            onClick={fetchRecipes}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={14} /> Obnovit seznam
          </button>
        </div>

        {loading ? (
          <p className="text-neutral-500 text-sm py-4">Načítám recepty...</p>
        ) : errorMsg ? (
          <p className="text-red-400 text-sm py-4">{errorMsg}</p>
        ) : recipes.length === 0 ? (
          <p className="text-neutral-500 text-sm py-4">Žádné recepty v databázi.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map(recipe => (
              <div
                key={recipe.slug}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 rounded-xl overflow-hidden mb-3 bg-neutral-950">
                    <img
                      src={recipe.image}
                      alt={recipe.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-white text-base mb-1">{recipe.title}</h4>
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                    {recipe.shortDescription}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
                  <span className="text-neutral-500">{recipe.date}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="p-1.5 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800 transition-colors"
                      title="Upravit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.slug)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                      title="Smazat"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vyskakovací okno pro výběr obrázku */}
      <ImageSelectorModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={selectedPath => setFormData(prev => ({ ...prev, image: selectedPath }))}
        folder="recipes"
      />
    </div>
  );
};