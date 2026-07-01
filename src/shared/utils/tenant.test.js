import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAppBasePath, getTenantRedirectUrl, isStagingRuntime } from './tenant';

function mockWindowLocation({ protocol, hostname, port = '', pathname = '/' }) {
  vi.stubGlobal('window', {
    location: { protocol, hostname, port, pathname },
  });
}

describe('isStagingRuntime', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true when pathname starts with /staging', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'ghoulhr.peopleaiq.com',
      pathname: '/staging/dashboard',
    });
    expect(isStagingRuntime()).toBe(true);
  });

  it('returns false on production tenant root', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'ghoulhr.peopleaiq.com',
      pathname: '/dashboard',
    });
    expect(isStagingRuntime()).toBe(false);
  });
});

describe('getAppBasePath', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns empty string for production root', () => {
    mockWindowLocation({ protocol: 'https:', hostname: 'ghoulhr.peopleaiq.com' });
    expect(getAppBasePath()).toBe('');
  });

  it('returns /staging from pathname when BASE_URL is production root', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'peopleaiq.com',
      pathname: '/staging/',
    });
    expect(getAppBasePath()).toBe('/staging');
  });

  it('returns /staging from pathname for nested staging routes', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'peopleaiq.com',
      pathname: '/staging/login',
    });
    expect(getAppBasePath()).toBe('/staging');
  });
});

describe('getTenantRedirectUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('redirects apex staging login to tenant staging URL', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'peopleaiq.com',
      pathname: '/staging/',
    });
    expect(getTenantRedirectUrl('ghoulhr')).toBe(
      'https://ghoulhr.peopleaiq.com/staging',
    );
  });

  it('redirects apex production login to tenant root URL', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'peopleaiq.com',
      pathname: '/',
    });
    expect(getTenantRedirectUrl('ghoulhr')).toBe('https://ghoulhr.peopleaiq.com');
  });

  it('redirects localhost to tenant localhost with port', () => {
    mockWindowLocation({
      protocol: 'http:',
      hostname: 'localhost',
      port: '5173',
      pathname: '/',
    });
    expect(getTenantRedirectUrl('ghoulhr')).toBe('http://ghoulhr.localhost:5173');
  });

  it('returns null when already on tenant subdomain', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'ghoulhr.peopleaiq.com',
      pathname: '/staging/',
    });
    expect(getTenantRedirectUrl('ghoulhr')).toBeNull();
  });

  it('returns null for missing subdomain', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'peopleaiq.com',
      pathname: '/staging/',
    });
    expect(getTenantRedirectUrl('')).toBeNull();
    expect(getTenantRedirectUrl(null)).toBeNull();
  });
});
