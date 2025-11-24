/**
 * Custom image loader for Next.js
 * When unoptimized: true is set, this loader simply returns the original src
 * to bypass Next.js image optimization endpoint
 */
export default function imageLoader({
  src,
  width: _width,
  quality: _quality,
}: {
  src: string;
  width?: number;
  quality?: number;
}) {
  // If src is already a full URL, return it as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // If src starts with /, it's a local path - return as-is
  if (src.startsWith('/')) {
    return src;
  }
  
  // For any other cases, return the src directly
  // This bypasses the _next/image endpoint when unoptimized: true
  return src;
}

