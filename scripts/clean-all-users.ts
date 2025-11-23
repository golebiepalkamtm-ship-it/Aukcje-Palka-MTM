
import admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';

// Użyj zmiennych środowiskowych z .env
if (admin.apps.length === 0) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Brak konfiguracji Firebase Admin SDK!');
    console.error('Sprawdź czy w .env są ustawione:');
    console.error('- FIREBASE_PROJECT_ID');
    console.error('- FIREBASE_CLIENT_EMAIL');
    console.error('- FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const auth = admin.auth();
const prisma = new PrismaClient();

async function deleteAllFirebaseUsers() {
  console.log('🔥 Usuwam użytkowników z Firebase Authentication...');
  try {
    let deletedCount = 0;
    let pageToken: string | undefined;
    do {
      const listUsersResult = await auth.listUsers(1000, pageToken);
      const uids = listUsersResult.users.map(user => user.uid);
      if (uids.length === 0) break;

      const deleteResult = await auth.deleteUsers(uids);
      deletedCount += deleteResult.successCount;
      console.log(`  ✅ Usunięto: ${deleteResult.successCount} użytkowników z Firebase`);
      pageToken = listUsersResult.pageToken;
    } while (pageToken);
    console.log(`📊 Firebase: Usunięto łącznie ${deletedCount} użytkowników\n`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Błąd podczas usuwania użytkowników z Firebase:', error);
    return 0;
  }
}

async function deleteAllPrismaUsers() {
  console.log('🗑️  Usuwam użytkowników z bazy danych Prisma...');
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('  ℹ️  Baza Prisma jest już pusta\n');
      return 0;
    }

    const result = await prisma.user.deleteMany({});
    console.log(`  ✅ Usunięto: ${result.count} użytkowników z Prisma`);
    console.log(`📊 Prisma: Usunięto łącznie ${result.count} użytkowników\n`);
    return result.count;
  } catch (error) {
    console.error('❌ Błąd podczas usuwania użytkowników z Prisma:', error);
    return 0;
  }
}

async function cleanAll() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     🧹 CZYSZCZENIE WSZYSTKICH UŻYTKOWNIKÓW                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const firebaseCount = await deleteAllFirebaseUsers();
  const prismaCount = await deleteAllPrismaUsers();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ PODSUMOWANIE                         ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Firebase Authentication: ${firebaseCount} użytkowników           ║`);
  console.log(`║  Baza danych (Prisma):    ${prismaCount} użytkowników           ║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  🎉 Wszystkie użytkownicy zostali usunięci!               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await prisma.$disconnect();
  process.exit(0);
}

cleanAll();
