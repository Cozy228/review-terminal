const trimTrailingSlashes = (value: string) => value.replace(/\/+$/g, '');
const trimLeadingSlashes = (value: string) => value.replace(/^\/+/g, '');

export const joinUrl = (baseUrl: string, path: string) =>
  `${trimTrailingSlashes(baseUrl)}/${trimLeadingSlashes(path)}`;

export const resolveBaseUrl = (raw: string | undefined, fallbackOrigin: string = window.location.origin) => {
  const value = (raw ?? '').trim();
  if (!value) return trimTrailingSlashes(fallbackOrigin);
  if (value === '/') return trimTrailingSlashes(window.location.origin);

  if (value.startsWith('/')) {
    return trimTrailingSlashes(new URL(value, fallbackOrigin).toString());
  }

  try {
    return trimTrailingSlashes(new URL(value).toString());
  } catch {
    return trimTrailingSlashes(new URL(`/${value}`, fallbackOrigin).toString());
  }
};
