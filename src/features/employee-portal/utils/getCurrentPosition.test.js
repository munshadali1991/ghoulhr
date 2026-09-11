import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentPosition } from './getCurrentPosition';

describe('getCurrentPosition', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves latitude and longitude when geolocation succeeds', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success) => {
          success({
            coords: { latitude: 12.9716, longitude: 77.5946 },
          });
        },
      },
    });

    await expect(getCurrentPosition()).resolves.toEqual({
      latitude: 12.9716,
      longitude: 77.5946,
    });
  });

  it('rejects when geolocation is unsupported', async () => {
    vi.stubGlobal('navigator', {});

    await expect(getCurrentPosition()).rejects.toThrow(
      'Location is not supported in this browser.',
    );
  });

  it('rejects when permission is denied', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (_success, error) => {
          error({ code: 1, message: 'denied' });
        },
      },
    });

    await expect(getCurrentPosition()).rejects.toThrow(
      'Location permission is required to punch attendance.',
    );
  });
});
