import { BrowserRouter } from 'react-router';
import { AuthProvider } from './context/AuthProvider.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
