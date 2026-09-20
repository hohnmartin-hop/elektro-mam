import mammoth from 'mammoth';
import JSZip from 'jszip';
import { RecipeIngredient, RecipeStep } from '../types';

export interface ParsedDocxResult {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageBase64: string | null;
}

export interface ParsedRecipeDocxResult {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageBase64: string | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

function stripDiacritics(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function slugify(text: string): string {
  return stripDiacritics(text)
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function parseIngredientLine(line: string): RecipeIngredient {
  const cleanLine = line.trim();
  const amountRegex = /^([\d\s,./\-\–]+(?:\s*(?:stroužků|stroužky|stroužek|nožiček|nožičky|nožička|střední|lžičky|lžička|balení|špetka|větší|menší|litru|litry|lžíce|hrnků|hrnky|hrnek|kusů|kusy|litr|lžic|dkg|kus|kg|ml|ks|g|l)(?=\s|\(|$)(?:\s*\([^)]+\))?)?)(.*)$/i;
    const match = cleanLine.match(amountRegex);

  if (match && match[1] && match[2].trim()) {
    return {
      amount: match[1].trim(),
      name: match[2].trim(),
    };
  }

  return {
    amount: '',
    name: cleanLine,
  };
}

export async function parseRecipeDocx(file: File): Promise<ParsedRecipeDocxResult> {
  const arrayBuffer = await file.arrayBuffer();

  const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
  const rawLines = (rawTextResult.value || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const fallbackName = file.name.replace(/\.[^/.]+$/, '');
  const title = rawLines.length > 0 ? rawLines[0] : fallbackName;
  const slug = slugify(title);

  const ingredients: RecipeIngredient[] = [];
  const steps: RecipeStep[] = [];
  let currentSection: 'none' | 'ingredients' | 'steps' = 'none';

  for (let i = 1; i < rawLines.length; i++) {
    const line = rawLines[i];
    const normalizedHeader = stripDiacritics(line).replace(/[:\-\–\.]/g, '').trim();

    if (normalizedHeader === 'suroviny' || normalizedHeader.startsWith('suroviny')) {
      currentSection = 'ingredients';
      continue;
    }

    if (
      normalizedHeader === 'postup' ||
      normalizedHeader.startsWith('postup') ||
      normalizedHeader.startsWith('priprava')
    ) {
      currentSection = 'steps';
      continue;
    }

    if (currentSection === 'ingredients') {
      const parsedIngredient = parseIngredientLine(line);
      if (parsedIngredient.name || parsedIngredient.amount) {
        ingredients.push(parsedIngredient);
      }
    } else if (currentSection === 'steps') {
      const cleanStep = line
        .replace(/^(\d+[\.\)]|\b(?:za\s+[a-zčšřžýáíéůú]+|krok\s*\d*)\s*[:\-\.,]?)\s*/i, '')
        .trim();

      if (cleanStep) {
        steps.push({ body: cleanStep });
      }
    }
  }

  const shortDescription = steps.length > 0
    ? steps[0].body.slice(0, 150) + (steps[0].body.length > 150 ? '...' : '')
    : title;

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
    console.warn('Chyba při čtení fotky z Wordu:', err);
  }

  return {
    title,
    slug,
    shortDescription,
    description: '',
    imageBase64,
    ingredients: ingredients.length > 0 ? ingredients : [{ name: '', amount: '' }],
    steps: steps.length > 0 ? steps : [{ body: '' }],
  };
}

export async function parseProjectDocx(file: File): Promise<ParsedDocxResult> {
  const arrayBuffer = await file.arrayBuffer();

  const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
  const rawLines = (rawTextResult.value || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const fallbackName = file.name.replace(/\.[^/.]+$/, '');
  const title = rawLines.length > 0 ? rawLines[0] : fallbackName;
  const slug = slugify(title);
  const shortDescription = rawLines.length > 1 ? rawLines[1].slice(0, 160) : title;

  const mammothAny = mammoth as any;
  const convertImageOption = mammothAny.images?.imgElement
    ? mammothAny.images.imgElement((element: any) => {
        return element.read('base64').then((imageBuffer: any) => {
          return {
            src: `data:${element.contentType};base64,${imageBuffer}`,
          };
        });
      })
    : undefined;

  const htmlResult = await mammoth.convertToHtml(
    { arrayBuffer },
    convertImageOption ? { convertImage: convertImageOption } : undefined
  );

  const description = htmlResult.value || '';

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
    console.warn('Chyba při čtení fotky:', err);
  }

  return {
    title,
    slug,
    shortDescription,
    description,
    imageBase64,
  };
}