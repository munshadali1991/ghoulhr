import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApiBaseUrl } from './appConfig';

function mockWindowLocation({ protocol, hostname, port = '', pathname = '/' }) {
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  vi.stubGlobal('window', {
    location: { protocol, hostname, port, pathname, origin },
  });
}

describe('getApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses staging API path on tenant subdomain when pathname is under /staging', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'ghoulhr.peopleaiq.com',
      pathname: '/staging/dashboard',
    });
    expect(getApiBaseUrl()).toBe(
      'https://ghoulhr.peopleaiq.com/staging/api/v1',
    );
  });

  it('uses staging API path on apex login host', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'peopleaiq.com',
      pathname: '/staging/',
    });
    expect(getApiBaseUrl()).toBe('https://peopleaiq.com/staging/api/v1');
  });

  it('uses production API path on tenant root', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'ghoulhr.peopleaiq.com',
      pathname: '/',
    });
    expect(getApiBaseUrl()).toBe(
      'https://ghoulhr.peopleaiq.com/ghoulhrms/api/v1',
    );
  });

  it('uses staging API path for /ghoulhrms/staging misroute', () => {
    mockWindowLocation({
      protocol: 'https:',
      hostname: 'ghoulhr.peopleaiq.com',
      pathname: '/ghoulhrms/staging',
    });
    expect(getApiBaseUrl()).toBe(
      'https://ghoulhr.peopleaiq.com/staging/api/v1',
    );
  });

  it('uses localhost backend for tenant localhost dev', () => {
    mockWindowLocation({
      protocol: 'http:',
      hostname: 'ghoulhr.localhost',
      pathname: '/',
    });
    expect(getApiBaseUrl()).toBe('http://ghoulhr.localhost:8080');
  });
});
