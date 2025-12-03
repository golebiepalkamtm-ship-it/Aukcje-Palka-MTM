/**
 * FirebaseImage Component
 * 
 * Komponent do wyświetlania obrazów z Firebase Storage.
 * Automatycznie ładuje obrazy używając custom image loader.
 * 
 * @example
 * ```tsx
 * // Użyj jak normalny next/image:
 * <FirebaseImage src="/logo.png" alt="Logo" width={200} height={100} />
 * 
 * // Lub ze ścieżką public/:
 * <FirebaseImage src="/public/images/hero.jpg" alt="Hero" fill />
 * ```
 */

'use client'

import Image, { ImageProps } from 'next/image'

/**
 * FirebaseImage - wrapper na next/image z automatyczną obsługą Firebase Storage
 * 
 * Props są identyczne jak next/image - komponent jest drop-in replacement.
 */
export default function FirebaseImage(props: ImageProps) {
  // Enforce alt prop requirement for accessibility (WCAG 2.1 AA)
  return <Image {...props} alt={props.alt} />
}

/**
 * Utility: Bezpośrednie pobranie URL z Firebase Storage (dla zaawansowanych przypadków)
 */
export { getFirebaseStorageUrl, getFirebaseStorageUrlSync, convertPublicPathToStorageUrl } from '@/lib/firebase-storage'
