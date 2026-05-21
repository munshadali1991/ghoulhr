import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';

export function PublicRoutes() {
  const login = useLoginForm();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            mode={login.mode}
            setMode={login.setMode}
            form={login.form}
            onFieldChange={login.handleChange}
            onSubmit={login.handleSubmit}
            loading={login.loading}
            error={login.error}
          />
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
