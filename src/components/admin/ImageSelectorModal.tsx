import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Upload, Loader2, RefreshCw } from 'lucide-react';

interface ImageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  folder: 'recipes' | 'projects';
}

// Statické obrázky z public pro zpětnou kompatibilitu
const localRecipeImages = Object.keys(
  import.meta.glob('/public/recipes/*.{jpg,jpeg,png,webp,svg}', { eager: true })
).map(path => path.replace('/public', ''));

const localProjectImages = Object.keys(
  import.meta.glob('/public/projects/*.{jpg,jpeg,png,webp,svg}', { eager: true })
).map(path => path.replace('/public', ''));

export const ImageSelectorModal: React.FC<ImageSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  folder,
}) => {
  const [remoteImages, setRemoteImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Načtení fotek ze Supabase Storage bucketu "images"
  const fetchStorageImages = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.storage.from('images').list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) {
        setErrorMsg('Chyba při načítání fotek ze Supabase: ' + error.message);
      } else if (data) {
        const urls = data
          .filter(file => file.name && !file.name.startsWith('.'))
          .map(file => {
            const { data: urlData } = supabase.storage
              .from('images')
              .getPublicUrl(`${folder}/${file.name}`);
            return urlData.publicUrl;
          });
        setRemoteImages(urls);
      }
    } catch (err: any) {
      setErrorMsg('Neočekávaná chyba: ' + (err.message || 'Neznámá chyba'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStorageImages();
    }
  }, [isOpen, folder]);

  // 2. Obsluha nahrání nové fotky
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Bezpečný název souboru bez diakritiky a mezer
    const sanitizedName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();

    const fileName = `${Date.now()}_${sanitizedName}`;
    const filePath = `${folder}/${fileName}`;

    setUploading(true);
    setErrorMsg('');

    try {
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Získání veřejné URL adresy
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Obnovíme seznam a fotku rovnou vybereme
      await fetchStorageImages();
      onSelect(urlData.publicUrl);
      onClose();
    } catch (err: any) {
      setErrorMsg('Nahrávání selhalo: ' + (err.message || 'Neznámá chyba'));
    } finally {
      setUploading(false);
      // Reset inputu, aby šel stejný soubor nahrát znovu v případě potřeby
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  const localImages = folder === 'recipes' ? localRecipeImages : localProjectImages;
  // Sloučíme vzdálené fotky ze Supabase a lokální fotky z repozitáře
  const allImages = [...remoteImages, ...localImages];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Záhlaví modálu */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              Fotky pro: <span className="text-amber-500">/{folder}</span>
            </h3>
            <button
              type="button"
              onClick={fetchStorageImages}
              disabled={loading}
              title="Obnovit seznam"
              className="p-1 text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-lg font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Lišta pro nahrání nové fotky */}
        <div className="p-4 bg-neutral-950/60 border-b border-neutral-800">
          <label className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-dashed border-neutral-700 hover:border-amber-500/80 bg-neutral-900/50 hover:bg-neutral-800/40 cursor-pointer transition-colors text-sm font-medium text-neutral-200">
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                <span>Nahrávám obrázek do Supabase...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-amber-500" />
                <span>Nahrát novou fotku ze zařízení</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>

          {errorMsg && (
            <p className="mt-2 text-xs text-red-400 bg-red-950/40 border border-red-800/50 p-2 rounded-lg">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Mřížka s fotkami */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading && allImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              <p className="text-sm">Načítám fotky...</p>
            </div>
          ) : allImages.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">
              Zatím zde nejsou žádné fotky. Můžeš nahrát první pomocí tlačítka výše.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allImages.map(imgSrc => (
                <button
                  key={imgSrc}
                  type="button"
                  onClick={() => {
                    onSelect(imgSrc);
                    onClose();
                  }}
                  className="group flex flex-col text-left p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500 transition-colors focus:outline-none"
                >
                  <div className="w-full h-28 bg-neutral-900 rounded-lg overflow-hidden mb-2">
                    <img
                      src={imgSrc}
                      alt="Náhled"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs text-neutral-300 truncate w-full" title={imgSrc}>
                    {imgSrc.split('/').pop()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spodní lišta */}
        <div className="p-4 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-colors"
          >
            Zavřít
          </button>
        </div>

      </div>
    </div>
  );
};