import { useCallback, useState } from 'react';
import { useAuth } from '@/app/providers/useAuth';
import {
  applyAuthResult,
  authenticate,
  authenticateWithBootstrap,
} from '@/features/auth/utils/authFlow';
import { isSubscriptionLoginError } from '@/features/auth/utils/subscriptionLoginError';

const EMPTY_FORM = { email: '', password: '' };

/**
 * @param {'tenant' | 'admin'} mode
 */
export function useLoginForm(mode) {
  const { setSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorKind, setErrorKind] = useState('generic');
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
      setErrorKind('generic');

      try {
        const authResult = await authenticate(mode, form);
        await applyAuthResult(authResult, setSession);
      } catch (loginError) {
        if (mode === 'admin' && loginError.status === 401) {
          try {
            const bootstrapResult = await authenticateWithBootstrap(form);
            if (await applyAuthResult(bootstrapResult, setSession)) {
              return;
            }
            return;
          } catch (bootstrapError) {
            setError(bootstrapError.message);
            setErrorKind(
              bootstrapError.status === 403 && isSubscriptionLoginError(bootstrapError.message)
                ? 'subscription'
                : 'generic',
            );
            return;
          }
        }
        setError(loginError.message);
        setErrorKind(
          loginError.status === 403 && isSubscriptionLoginError(loginError.message)
            ? 'subscription'
            : 'generic',
        );
      } finally {
        setLoading(false);
      }
    },
    [form, mode, setSession],
  );

  return {
    mode,
    form,
    loading,
    error,
    errorKind,
    handleChange,
    handleSubmit,
  };
}
