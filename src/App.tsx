import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { RecipesPage } from '@/pages/RecipesPage';
import { RecipeDetailPage } from '@/pages/RecipeDetailPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { Guestbook } from '@/pages/Guestbook';
import { NotFoundPage } from '@/pages/NotFoundPage';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/projekty', element: <ProjectsPage /> },
      { path: '/projekty/:slug', element: <ProjectDetailPage /> },
      { path: '/recepty', element: <RecipesPage /> },
      { path: '/recepty/:slug', element: <RecipeDetailPage /> },
      { path: '/o-mne', element: <AboutPage /> },
      { path: '/kontakt', element: <ContactPage /> },
      { path: '/kniha-prani', element: <Guestbook /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}