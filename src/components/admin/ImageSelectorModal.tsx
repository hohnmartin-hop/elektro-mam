import React from 'react';

interface ImageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  folder: 'recipes' | 'projects';
}

// Dynamické načtení všech obrázků ze složek v public/
const recipeImages = Object.keys(
  import.meta.glob('/public/recipes/*.{jpg,jpeg,png,webp,svg}', { eager: true })
).map(path => path.replace('/public', ''));

const projectImages = Object.keys(
  import.meta.glob('/public/projects/*.{jpg,jpeg,png,webp,svg}', { eager: true })
).map(path => path.replace('/public', ''));

export const ImageSelectorModal: React.FC<ImageSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  folder,
}) => {
  if (!isOpen) return null;

  const images = folder === 'recipes' ? recipeImages : projectImages;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">
            Vyber fotku ze složky: <span className="text-amber-500">/{folder}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-lg font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {images.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">
              Ve složce nejsou žádné obrázky.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map(imgSrc => (
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
                      alt={imgSrc}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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