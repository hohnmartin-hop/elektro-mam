import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Project, ProjectCategory, Component, ProjectStep } from '../../types';
import { Plus, Trash2, Edit3, X, Check, FolderGit2, RefreshCw, Layers, Image, FileText } from 'lucide-react';
import { ImageSelectorModal } from './ImageSelectorModal';
import { parseProjectDocx } from '../../utils/docxParser';

const CATEGORIES: ProjectCategory[] = [
  'ESP32',
  'Arduino',
  'Napájení',
  'Mikroelektronika',
  'Opravy',
  'DIY',
  '3D tisk',
  'Ostatní'
];

export const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isImportingDocx, setIsImportingDocx] = useState(false);

  const initialFormState: Project = {
    slug: '',
    title: '',
    category: 'ESP32',
    shortDescription: '',
    image: '',
    imageAlt: '',
    date: new Date().toISOString().split('T')[0],
    featured: false,
    purpose: '',
    description: '',
    components: [{ name: '', qty: '', link: '' }],
    steps: [{ title: '', body: '' }],
    notes: '',
    code: ''
  };

  const [formData, setFormData] = useState<Project>(initialFormState);
  const [isNewProject, setIsNewProject] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Chyba při načítání projektů.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateNew = () => {
    setFormData({
      ...initialFormState,
      date: new Date().toISOString().split('T')[0]
    });
    setIsNewProject(true);
    setIsEditing(true);
  };

  const handleEdit = (project: Project) => {
    setFormData({
      ...project,
      components: project.components && project.components.length > 0
        ? project.components
        : [{ name: '', qty: '', link: '' }],
      steps: project.steps && project.steps.length > 0
        ? project.steps
        : [{ title: '', body: '' }],
      notes: project.notes || '',
      code: project.code || ''
    });
    setIsNewProject(false);
    setIsEditing(true);
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm(`Opravdu chceš smazat projekt se slugem "${slug}"?`)) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('slug', slug);

      if (error) throw error;
      setProjects(prev => prev.filter(p => p.slug !== slug));
    } catch (err: any) {
      alert('Chyba při mazání: ' + err.message);
    }
  };

  // Správa importu z Wordu (.docx)
  const handleDocxImport = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      alert('Vyber prosím soubor typu Word (.docx).');
      return;
    }

    try {
      setIsImportingDocx(true);
      const parsed = await parseProjectDocx(file);

      setFormData(prev => ({
        ...prev,
        title: parsed.title,
        slug: parsed.slug,
        shortDescription: parsed.shortDescription,
        description: parsed.description,
        // Pravidlo: Pokud fotka ještě není vybraná ručně a ve Wordu fotka je, použije se
        image: prev.image ? prev.image : (parsed.imageBase64 || prev.image),
        imageAlt: prev.imageAlt || parsed.title
      }));
    } catch (err) {
      console.error('Chyba při čtení Word souboru:', err);
      alert('Při zpracování souboru Word došlo k chybě.');
    } finally {
      setIsImportingDocx(false);
    }
  };

  // Správa součástek
  const handleComponentChange = (index: number, field: keyof Component, value: string) => {
    const updated = [...(formData.components || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, components: updated });
  };

  const addComponent = () => {
    setFormData({
      ...formData,
      components: [...(formData.components || []), { name: '', qty: '', link: '' }]
    });
  };

  const removeComponent = (index: number) => {
    setFormData({
      ...formData,
      components: (formData.components || []).filter((_, i) => i !== index)
    });
  };

  // Správa kroků postupu
  const handleStepChange = (index: number, field: keyof ProjectStep, value: string) => {
    const updated = [...(formData.steps || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, steps: updated });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...(formData.steps || []), { title: '', body: '' }]
    });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: (formData.steps || []).filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const cleanComponents = (formData.components || []).filter(c => c.name.trim() !== '');
    const cleanSteps = (formData.steps || []).filter(s => s.title.trim() !== '' || s.body.trim() !== '');

    const payload = {
      ...formData,
      slug: formData.slug.trim(),
      title: formData.title.trim(),
      category: formData.category,
      shortDescription: formData.shortDescription.trim(),
      purpose: formData.purpose.trim(),
      description: formData.description.trim(),
      components: cleanComponents,
      steps: cleanSteps,
      notes: formData.notes?.trim() || null,
      code: formData.code?.trim() || null
    };

    if (!payload.slug || !payload.title) {
      alert('Pole Slug a Název projektu jsou povinné.');
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .upsert(payload);

      if (error) throw error;

      setIsEditing(false);
      fetchProjects();
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
            <FolderGit2 className="w-6 h-6 text-sky-500" />
            Správa projektů
          </h2>
          <p className="text-sm text-neutral-400">Přidávání, úprava a mazání projektů v databázi Supabase</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
            title="Aktualizovat seznam"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {!isEditing && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-neutral-950 font-semibold hover:bg-sky-400 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Přidat projekt
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
              {isNewProject ? 'Nový projekt' : `Úprava: ${formData.title}`}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rychlý import z Wordu (.docx) */}
          <div className="p-5 rounded-2xl bg-neutral-950 border-2 border-dashed border-neutral-800 hover:border-sky-500/60 transition-colors text-center">
            <input
              type="file"
              id="docx-upload"
              accept=".docx"
              className="hidden"
              disabled={isImportingDocx}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleDocxImport(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
            <label
              htmlFor="docx-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2 text-neutral-300 hover:text-white"
            >
              <FileText className="w-8 h-8 text-sky-500" />
              <span className="font-semibold text-sm text-sky-400">
                {isImportingDocx ? '⏳ Načítám data z Wordu...' : '📄 Klikni zde pro načtení projektu z Wordu (.docx)'}
              </span>
              <span className="text-xs text-neutral-500">
                Automaticky předvyplní název, slug, popis a vloží první obrázek z dokumentu
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Slug (URL identifikátor) *
              </label>
              <input
                type="text"
                required
                disabled={!isNewProject}
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="např. esp32-mereni-spotreby"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Název projektu *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="např. ESP32 Měřič spotřeby"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Kategorie *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Datum vytvoření
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Hlavní obrázek projektu
                </label>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                >
                  <Image size={14} />
                  Vybrat z nahraných fotek
                </button>
              </div>
              <input
                type="text"
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                placeholder="/projects/nazev-fotky.jpg nebo Base64 z Wordu"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500"
              />
              {formData.image && (
                <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
                  <img src={formData.image} alt="Náhled" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Popisek obrázku (Alt text)
              </label>
              <input
                type="text"
                value={formData.imageAlt}
                onChange={e => setFormData({ ...formData, imageAlt: e.target.value })}
                placeholder="Stručný popis obrázku pro přístupnost"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Krátký popis (pro náhledovou kartu) *
              </label>
              <textarea
                required
                rows={2}
                value={formData.shortDescription}
                onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="1-2 věty shrnující celý projekt..."
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 resize-y"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Účel projektu (Purpose)
              </label>
              <textarea
                rows={2}
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="K čemu zařízení slouží a proč vzniklo..."
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 resize-y"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Kompletní popis projektu
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Podrobný popis fungování a zapojení..."
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 resize-y"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured || false}
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded bg-neutral-950 border-neutral-800 text-sky-500 focus:ring-sky-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-neutral-300 cursor-pointer">
                Zvýraznit projekt na hlavní stránce (Doporučený projekt)
              </label>
            </div>
          </div>

          {/* Seznam součástek */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500" />
                Součástky a materiál
              </h4>
              <button
                type="button"
                onClick={addComponent}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Přidat součástku
              </button>
            </div>

            <div className="space-y-2">
              {(formData.components || []).map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Název (např. ESP32 DevKit)"
                    value={comp.name}
                    onChange={e => handleComponentChange(idx, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    placeholder="Množství (např. 1×)"
                    value={comp.qty}
                    onChange={e => handleComponentChange(idx, 'qty', e.target.value)}
                    className="w-28 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    placeholder="Odkaz (volitelný)"
                    value={comp.link || ''}
                    onChange={e => handleComponentChange(idx, 'link', e.target.value)}
                    className="w-44 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 hidden sm:block"
                  />
                  <button
                    type="button"
                    onClick={() => removeComponent(idx)}
                    className="p-2 text-neutral-500 hover:text-red-400 transition"
                    title="Odstranit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Kroky postupu */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Kroky postupu
              </h4>
              <button
                type="button"
                onClick={addStep}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Přidat krok
              </button>
            </div>

            <div className="space-y-4">
              {(formData.steps || []).map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 uppercase">Krok {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-neutral-500 hover:text-red-400 transition text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Smazat krok
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Název kroku (např. Zapojení napájení)"
                    value={step.title}
                    onChange={e => handleStepChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="Popis kroku..."
                    value={step.body}
                    onChange={e => handleStepChange(idx, 'body', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 resize-y"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Poznámky a kód */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Důležité poznámky / Upozornění
              </label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Pozor na polaritu..."
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Zdrojový kód / Ukázka
              </label>
              <textarea
                rows={3}
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="// Vlož C++ / Arduino kód..."
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 font-mono text-xs resize-y"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white transition text-sm font-medium"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-neutral-950 font-semibold hover:bg-sky-400 transition text-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Ukládám...' : 'Uložit projekt'}
            </button>
          </div>
        </form>
      )}

      {/* Seznam projektů */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <div
            key={project.slug}
            className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 font-medium">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                    Doporučeno
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white line-clamp-1">{project.title}</h3>
              <p className="text-xs text-neutral-400 line-clamp-2">{project.shortDescription}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-800/60">
              <span className="text-xs text-neutral-500 font-mono">{project.slug}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-sky-400 hover:bg-neutral-800 transition"
                  title="Upravit projekt"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(project.slug)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition"
                  title="Smazat projekt"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ImageSelectorModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={selectedPath => setFormData(prev => ({ ...prev, image: selectedPath }))}
        folder="projects"
      />
    </div>
  );
};