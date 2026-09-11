export type ProjectCategory =
  | 'ESP32'
  | 'Arduino'
  | 'Napájení'
  | 'Mikroelektronika'
  | 'Opravy'
  | 'DIY'
  | '3D tisk'
  | 'Ostatní';

export interface Component {
  name: string;
  qty: string;
  link?: string;
}

export interface ProjectStep {
  title: string;
  body: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  shortDescription: string;
  image: string;
  imageAlt: string;
  date: string;
  featured?: boolean;
  purpose: string;
  description: string;
  components?: Component[];
  steps?: ProjectStep[];
  notes?: string;
  links?: { label: string; url: string }[];
  code?: string;
  gallery?: string[];
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface RecipeStep {
  body: string;
}

export interface Recipe {
  slug: string;
  title: string;
  shortDescription: string;
  image: string;
  imageAlt: string;
  date: string;
  intro: string;
  description?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  notes?: string;
  servings?: string;
  prepTime?: string;
}