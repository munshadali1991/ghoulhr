import { useCallback, useState } from 'react';
import { useAuth } from '@/app/providers/useAuth';
import {
  authenticate,
  authenticateWithBootstrap,
  finalizeLogin,
} from '@/features/auth/utils/authFlow';
import { isSubscriptionLoginError } from '@/features/auth/utils/subscriptionLoginError';

const EMPTY_FORM = { email: '', password: '' };

/**
 * @param {'tenant' | 'admin'} mode
 */
export function useLoginForm(mode) {
  const { setSession, bootstrapError, clearBootstrapError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorKind, setErrorKind] = useState('generic');
  const [form, setForm] = useState(EMPTY_FORM);

  const displayError = error || bootstrapError || '';

  const handleChange = useCallback(
    (field) => (event) => {
      if (bootstrapError) {
        clearBootstrapError();
      }
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    },
    [bootstrapError, clearBootstrapError],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setLoading(true);
      setError('');
      setErrorKind('generic');
      if (bootstrapError) {
        clearBootstrapError();
      }

      try {
        const authResult = await authenticate(mode, form);
        if (await finalizeLogin(authResult, setSession)) {
          return;
        }
      } catch (loginError) {
        if (mode === 'admin' && loginError.status === 401) {
          try {
            const bootstrapResult = await authenticateWithBootstrap(form);
            if (await finalizeLogin(bootstrapResult, setSession)) {
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
    [bootstrapError, clearBootstrapError, form, mode, setSession],
  );

  return {
    mode,
    form,
    loading,
    error: displayError,
    errorKind,
    handleChange,
    handleSubmit,
  };
}
