import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { ADMIN_CP_PATH } from '@/app/constants';

function TenantLoginRoute() {
  const login = useLoginForm('tenant');

  return (
    <LoginPage
      mode="tenant"
      form={login.form}
      onFieldChange={login.handleChange}
      onSubmit={login.handleSubmit}
      loading={login.loading}
      error={login.error}
      errorKind={login.errorKind}
    />
  );
}

function AdminLoginRoute() {
  const login = useLoginForm('admin');

  return (
    <LoginPage
      mode="admin"
      form={login.form}
      onFieldChange={login.handleChange}
      onSubmit={login.handleSubmit}
      loading={login.loading}
      error={login.error}
      errorKind={login.errorKind}
    />
  );
}

export function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TenantLoginRoute />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path={ADMIN_CP_PATH} element={<AdminLoginRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
