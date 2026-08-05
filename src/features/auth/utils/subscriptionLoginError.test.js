import { describe, expect, it } from 'vitest';
import { isSubscriptionLoginError } from './subscriptionLoginError';

const EXPIRED_MESSAGE =
  'Your organization plan has expired. Please renew the plan to continue the services.';

const MISSING_MESSAGE =
  'No active subscription plan for this organization. Please contact your administrator to renew the plan and continue services.';

describe('isSubscriptionLoginError', () => {
  it('detects expired plan message from backend', () => {
    expect(isSubscriptionLoginError(EXPIRED_MESSAGE)).toBe(true);
  });

  it('detects missing plan message from backend', () => {
    expect(isSubscriptionLoginError(MISSING_MESSAGE)).toBe(true);
  });

  it('does not treat first character only as subscription error', () => {
    expect(isSubscriptionLoginError('Y')).toBe(false);
  });
});

describe('auth API error message parsing', () => {
  function parseAuthErrorMessage(payload) {
    let message = 'Request failed. Please try again.';
    if (payload?.message) {
      message = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : String(payload.message);
    } else if (payload?.error) {
      message = String(payload.error);
    }
    return message;
  }

  it('returns full string when NestJS message is a string', () => {
    const parsed = parseAuthErrorMessage({ message: EXPIRED_MESSAGE });
    expect(parsed).toBe(EXPIRED_MESSAGE);
    expect(isSubscriptionLoginError(parsed)).toBe(true);
  });

  it('joins validation errors when message is an array', () => {
    expect(
      parseAuthErrorMessage({ message: ['email is required', 'password is required'] }),
    ).toBe('email is required, password is required');
  });
});
