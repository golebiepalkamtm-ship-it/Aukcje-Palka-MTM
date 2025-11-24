/**
 * Custom image loader for Next.js
 * When unoptimized: true is set, this loader simply returns the original src
 * to bypass Next.js image optimization endpoint
 */
import { buildAssetCdnUrl } from './asset-proxy';

export default function imageLoader({
  src,
  width: _width,
  quality: _quality,
}: {
  src: string;
  width?: number;
  quality?: number;
}) {
  // Remove any query parameters that might have been added
  const cleanSrc = src.split('?')[0];

  if (cleanSrc.startsWith('data:')) {
    return cleanSrc;
  }

  // Remote URLs stay untouched (including Firebase Storage URLs)
  if (cleanSrc.startsWith('http://') || cleanSrc.startsWith('https://')) {
    return cleanSrc;
  }

  // Use asset proxy to build CDN URL (handles Firebase Storage format automatically)
  const cdnUrl = buildAssetCdnUrl(cleanSrc);
  if (cdnUrl) {
    return cdnUrl;
  }

  // Fallback: serve local public asset
  return cleanSrc.startsWith('/') ? cleanSrc : `/${cleanSrc}`;
}

