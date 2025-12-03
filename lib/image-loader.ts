/**
 * Custom image loader for Next.js with Firebase Storage support
 *
 * Inteligentne ładowanie obrazów:
 * - Lokalne obrazy (statyczne): /logo.png, /champions/, /press/ → domyślne ładowanie Next.js
 * - Firebase Storage: https://firebasestorage.googleapis.com/... → Firebase loader
 * - Względne ścieżki aukcji: /uploads/image/... → konwertuj na Firebase Storage
 *
 * @module lib/image-loader
 */

/**
 * Konwertuje ścieżkę aukcji na Firebase Storage URL
 *
 * @param path - Ścieżka do pliku aukcji (np. '/uploads/image/filename.jpg')
 * @returns Firebase Storage URL lub oryginalna ścieżka jeśli bucket nie skonfigurowany
 */
function convertAuctionImageToFirebaseStorageUrl(path: string): string {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

  if (!bucketName) {
    console.warn('[Image Loader] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET not configured, using local path')
    return path
  }

  // Tylko dla obrazów aukcji w folderze uploads
  if (!path.startsWith('/uploads/')) {
    return path
  }

  // Remove leading slash
  let cleanPath = path.startsWith('/') ? path.slice(1) : path

  // Encode path for URL
  const encodedPath = encodeURIComponent(cleanPath)

  // Construct Firebase Storage URL
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`
}

/**
 * Custom image loader for Next.js
 *
 * Routing logic:
 * 1. Firebase Storage URLs → return as-is
 * 2. Lokalne statyczne obrazy (/logo, /champions/, /press/) → return as-is (domyślne ładowanie)
 * 3. Obrazy aukcji (/uploads/) → convert to Firebase Storage URL
 * 4. Inne przypadki → return as-is
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
  // If src is already a Firebase Storage URL, return it as-is
  if (src.includes('firebasestorage.googleapis.com')) {
    return src;
  }

  // If src starts with /uploads/, convert to Firebase Storage URL (auction images)
  if (src.startsWith('/uploads/')) {
    return convertAuctionImageToFirebaseStorageUrl(src);
  }

  // For local static images (/logo, /champions/, /press/, etc.), use default Next.js loading
  // This includes all static assets that are always available
  if (src.startsWith('/')) {
    return src;
  }

}

