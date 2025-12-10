import { handleApiError } from '@/lib/error-handling';
import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { requirePhoneVerification } from '@/lib/phone-verification';
import { apiRateLimit } from '@/lib/rate-limit';
import { getStorage } from 'firebase-admin/storage';
import { getAdminApp } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']; // Dodano obrazy do dokumentów
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file: File, type: string): { valid: boolean; error?: string } {
  if (type === 'image') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Nieprawidłowy typ obrazu' };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { valid: false, error: 'Obraz jest za duży (max 5MB)' };
    }
  } else if (type === 'video') {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return { valid: false, error: 'Nieprawidłowy typ wideo' };
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return { valid: false, error: 'Wideo jest za duże (max 50MB)' };
    }
  } else if (type === 'document') {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return { valid: false, error: 'Nieprawidłowy typ dokumentu' };
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      return { valid: false, error: 'Dokument jest za duży (max 10MB)' };
    }
  }
  return { valid: true };
}

function generateSafeFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  return `${baseName}_${timestamp}_${randomString}.${extension}`;
}

async function uploadToFirebaseStorage(file: File, type: string, userId: string): Promise<string> {
  console.log('🔥 [Upload] Starting Firebase Storage upload process');

  const app = getAdminApp()
  if (!app) {
    console.error('❌ [Upload] Firebase Admin SDK not initialized');
    throw new Error('Firebase Admin SDK not initialized')
  }

  console.log('✅ [Upload] Firebase Admin SDK is available');

  // Pobierz nazwę bucketa z zmiennych środowiskowych
  const storageBucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;

  if (!storageBucketName) {
    console.error('❌ [Upload] Firebase Storage bucket name not configured:', {
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET
    });
    throw new Error('Firebase Storage bucket name is not configured. Set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET or FIREBASE_STORAGE_BUCKET environment variable.')
  }

  console.log('📦 [Upload] Using storage bucket:', storageBucketName);

  // Użyj jawnie nazwy bucketa
  const bucket = getStorage(app).bucket(storageBucketName)
  console.log('🪣 [Upload] Bucket object created:', bucket.name);

  const safeFileName = generateSafeFileName(file.name)
  const storagePath = `uploads/${type}/${userId}/${safeFileName}`
  console.log('📁 [Upload] Storage path:', storagePath);

  const fileRef = bucket.file(storagePath)
  console.log('📄 [Upload] File reference created');

  console.log('🔄 [Upload] Converting file to buffer...');
  const buffer = Buffer.from(await file.arrayBuffer())
  console.log('✅ [Upload] File converted to buffer, size:', buffer.length);

  console.log('⬆️ [Upload] Starting upload to Firebase Storage...');
  try {
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      },
      public: true,
    })
    console.log('✅ [Upload] File uploaded successfully to Firebase Storage');
  } catch (uploadError: any) {
    console.error('❌ [Upload] Firebase Storage upload failed:', uploadError);

    // Szczegółowa analiza błędu Firebase
    if (uploadError.code) {
      console.error('🔍 [Upload] Firebase error code:', uploadError.code);
    }
    if (uploadError.message) {
      console.error('🔍 [Upload] Firebase error message:', uploadError.message);
    }

    // Fallback do lokalnego przechowywania jeśli Firebase nie działa
    console.log('🔄 [Upload] Attempting fallback to local storage...');
    return await uploadToLocalStorage(file, type, userId);
  }

  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`
  console.log('🔗 [Upload] Public URL generated:', publicUrl);

  return publicUrl;
}

async function uploadToLocalStorage(file: File, type: string, userId: string): Promise<string> {
  console.log('🏠 [Upload] Starting local storage upload process');

  const safeFileName = generateSafeFileName(file.name);
  const localPath = join(process.cwd(), 'public', 'uploads', type, userId);
  const filePath = join(localPath, safeFileName);

  console.log('📁 [Upload] Local file path:', filePath);
  console.log('📂 [Upload] Working directory:', process.cwd());

  try {
    // Upewnij się, że katalog istnieje
    await mkdir(localPath, { recursive: true });
    console.log('✅ [Upload] Directory created/verified at:', localPath);

    // Konwertuj plik na buffer i zapisz
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('📏 [Upload] File buffer size:', buffer.length, 'bytes');

    await writeFile(filePath, buffer);
    console.log('✅ [Upload] File saved successfully to:', filePath);

    // Sprawdź czy plik istnieje
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      console.log('✅ [Upload] File exists on disk');
    } else {
      console.error('❌ [Upload] File not found on disk after save!');
    }

    // Zwróć publiczny URL
    const publicUrl = `/uploads/${type}/${userId}/${safeFileName}`;
    console.log('🔗 [Upload] Local public URL generated:', publicUrl);

    return publicUrl;
  } catch (localError) {
    console.error('❌ [Upload] Local storage upload failed:', localError);
    console.error('Stack trace:', localError instanceof Error ? localError.stack : 'No stack trace');
    throw new Error(`Nie udało się zapisać pliku lokalnie: ${localError instanceof Error ? localError.message : String(localError)}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację Firebase
    const authResult = await requireFirebaseAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { decodedToken } = authResult;
    const userId = decodedToken.uid;

    // Sprawdź weryfikację telefonu dla uploadu plików
    const phoneVerificationError = await requirePhoneVerification(request);
    if (phoneVerificationError) {
      return phoneVerificationError;
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const type = formData.get('type') as string; // 'image', 'video', 'document'

    console.log('📂 [API Upload] Otrzymano żądanie uploadu:', {
      type,
      filesCount: files?.length,
      fileNames: files?.map(f => f.name),
      fileSizes: files?.map(f => f.size),
      fileTypes: files?.map(f => f.type)
    });

    if (!files || files.length === 0) {
      console.error('❌ [API Upload] Brak plików w żądaniu');
      return NextResponse.json({ error: 'Brak plików do przesłania' }, { status: 400 });
    }

    if (!type || !['image', 'video', 'document'].includes(type)) {
      console.error('❌ [API Upload] Nieprawidłowy typ pliku:', type);
      return NextResponse.json({ error: 'Nieprawidłowy typ pliku' }, { status: 400 });
    }

    const uploadedFiles: string[] = [];

    for (const file of files) {
      const validation = validateFile(file, type);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      try {
        // Upload to Firebase Storage
        const publicUrl = await uploadToFirebaseStorage(file, type, userId);
        uploadedFiles.push(publicUrl);
      } catch (error) {
        console.error('❌ [API Upload] Błąd uploadu do Firebase Storage:', error);
        return handleApiError(error, request, { endpoint: 'upload', file: file.name });
      }
    }

    return NextResponse.json({
      message: 'Pliki zostały przesłane pomyślnie',
      files: uploadedFiles,
    });
  } catch (error) {
    return handleApiError(error, request, { endpoint: 'upload' });
  }
}
