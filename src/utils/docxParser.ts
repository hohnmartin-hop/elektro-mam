import mammoth from 'mammoth';
import JSZip from 'jszip';

export interface ParsedDocxResult {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageBase64: string | null;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function parseProjectDocx(file: File): Promise<ParsedDocxResult> {
  const arrayBuffer = await file.arrayBuffer();

  // 1. Získání textu pro název, slug a krátký popis
  const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
  const rawLines = (rawTextResult.value || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const fallbackName = file.name.replace(/\.[^/.]+$/, '');
  const title = rawLines.length > 0 ? rawLines[0] : fallbackName;
  const slug = slugify(title);
  const shortDescription = rawLines.length > 1 ? rawLines[1].slice(0, 160) : title;

  // 2. Převod kompletního dokumentu do HTML se zachováním VŠECH fotek na původních pozicích
  const htmlResult = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.inline((element) => {
        return element.read('base64').then((imageBuffer) => {
          return {
            src: `data:${element.contentType};base64,${imageBuffer}`
          };
        });
      })
    }
  );

  const description = htmlResult.value || '';

  // 3. Extrakce první fotky pro hlavní kartu / náhled projektu
  let imageBase64: string | null = null;
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const mediaFiles: string[] = [];

    zip.forEach((relativePath) => {
      if (relativePath.startsWith('word/media/') && !relativePath.endsWith('/')) {
        mediaFiles.push(relativePath);
      }
    });

    mediaFiles.sort();

    if (mediaFiles.length > 0) {
      const firstImagePath = mediaFiles[0];
      const imageEntry = zip.file(firstImagePath);
      if (imageEntry) {
        const ext = firstImagePath.split('.').pop()?.toLowerCase() || 'jpeg';
        const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        const base64Data = await imageEntry.async('base64');
        imageBase64 = `data:${mimeType};base64,${base64Data}`;
      }
    }
  } catch (err) {
    console.warn('Chyba při čtení náhledového obrázku:', err);
  }

  return {
    title,
    slug,
    shortDescription,
    description,
    imageBase64
  };
}