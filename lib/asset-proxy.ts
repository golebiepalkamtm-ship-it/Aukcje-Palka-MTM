const assetBaseEnv =
  process.env.ASSET_BASE_URL ||
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
  process.env.ASSET_CDN_BASE_URL;

const trimmedBase = assetBaseEnv?.trim().replace(/\/+$/, '');
const isFirebaseStorage = trimmedBase?.includes('firebasestorage.googleapis.com') || 
                          trimmedBase?.includes('storage.googleapis.com');

const ensureFirebaseObjectPath = (base: string) => {
  if (base.endsWith('/o')) return base;
  return `${base}/o`;
};

const ensureAltMedia = (url: string) => {
  if (url.includes('alt=media')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}alt=media`;
};

const encodePath = (path: string) => encodeURIComponent(path.replace(/^\//, ''));

export function buildAssetCdnUrl(path: string): string | null {
  if (!trimmedBase) return null;
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (isFirebaseStorage) {
    // Firebase Storage format: https://storage.googleapis.com/bucket/o/encodedPath?alt=media
    const base = ensureFirebaseObjectPath(trimmedBase);
    // Remove leading slash before encoding (encodePath already does this)
    const pathWithoutLeadingSlash = normalized.replace(/^\//, '');
    const encoded = encodePath(pathWithoutLeadingSlash);
    const url = `${base}/${encoded}`;
    return ensureAltMedia(url);
  }

  // Standard CDN format
  return `${trimmedBase}${normalized}`;
}

export function hasAssetCdn(): boolean {
  return Boolean(trimmedBase);
}

