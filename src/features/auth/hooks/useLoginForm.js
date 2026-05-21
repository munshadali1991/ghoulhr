import { useCallback, useState } from 'react';
import { useAuth } from '@/app/providers/useAuth';
import {
  applyAuthResult,
  authenticate,
  authenticateWithBootstrap,
} from '@/features/auth/utils/authFlow';

const EMPTY_FORM = { email: '', password: '' };

export function useLoginForm() {
  const { setSession } = useAuth();
  const [mode, setMode] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const handleChange = useCallback(
    (field) => (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setLoading(true);
      setError('');

      try {
        const authResult = await authenticate(mode, form);
        applyAuthResult(authResult, setSession);
      } catch (loginError) {
        if (mode === 'admin' && loginError.status === 401) {
          try {
            const bootstrapResult = await authenticateWithBootstrap(form);
            if (applyAuthResult(bootstrapResult, setSession)) {
              return;
            }
            return;
          } catch (bootstrapError) {
            setError(bootstrapError.message);
            return;
          }
        }
        setError(loginError.message);
      } finally {
        setLoading(false);
      }
    },
    [form, mode, setSession],
  );

  return {
    mode,
    setMode,
    form,
    loading,
    error,
    handleChange,
    handleSubmit,
  };
}
