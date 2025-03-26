import { createBrowserRouter } from 'react-router-dom';
import App from './App';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'courses',
        lazy: () => import('./pages/courses')
      },
      {
        path: 'practice',
        lazy: () => import('./pages/practice')
      },
      {
        path: 'editor',
        lazy: () => import('./pages/editor')
      }
    ]
  }
]);

export default router;