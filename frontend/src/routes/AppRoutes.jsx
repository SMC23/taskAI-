import { Navigate, Route, Routes } from 'react-router';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { NewProjectPage } from '../pages/NewProjectPage.jsx';
import { ProjectDetailPage } from '../pages/ProjectDetailPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { UsagePage } from '../pages/UsagePage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { PublicOnlyRoute } from './PublicOnlyRoute.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        {/* La ruta estática "new" tiene prioridad sobre el parámetro ":id" */}
        <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/usage" element={<UsagePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
