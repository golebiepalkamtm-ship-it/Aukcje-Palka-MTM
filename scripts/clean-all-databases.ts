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

async function cleanAllPrismaTables() {
  console.log('🗑️  Czyszczę wszystkie tabele w Prisma/PostgreSQL...\n');
  
  try {
    // Usuwanie w odpowiedniej kolejności (od zależnych do głównych)
    const tables = [
      { name: 'UserMessage', model: prisma.userMessage },
      { name: 'Conversation', model: prisma.conversation },
      { name: 'Message', model: prisma.message },
      { name: 'Review', model: prisma.review },
      { name: 'Transaction', model: prisma.transaction },
      { name: 'Notification', model: prisma.notification },
      { name: 'PushSubscription', model: prisma.pushSubscription },
      { name: 'UserRating', model: prisma.userRating },
      { name: 'WatchlistItem', model: prisma.watchlistItem },
      { name: 'Bid', model: prisma.bid },
      { name: 'AuctionAsset', model: prisma.auctionAsset },
      { name: 'Auction', model: prisma.auction },
      { name: 'BreederMeeting', model: prisma.breederMeeting },
      { name: 'Session', model: prisma.session },
      { name: 'Account', model: prisma.account },
      { name: 'User', model: prisma.user },
      { name: 'Pigeon', model: prisma.pigeon },
      { name: 'Reference', model: prisma.reference },
      { name: 'VerificationToken', model: prisma.verificationToken },
    ];

    let totalDeleted = 0;
    for (const table of tables) {
      try {
        const count = await table.model.count();
        if (count > 0) {
          const result = await table.model.deleteMany({});
          console.log(`  ✅ ${table.name}: Usunięto ${result.count} rekordów`);
          totalDeleted += result.count;
        } else {
          console.log(`  ℹ️  ${table.name}: Tabela jest pusta`);
        }
      } catch (error) {
        console.error(`  ❌ Błąd podczas usuwania z ${table.name}:`, error);
      }
    }

    console.log(`\n📊 Prisma/PostgreSQL: Usunięto łącznie ${totalDeleted} rekordów\n`);
    return totalDeleted;
  } catch (error) {
    console.error('❌ Błąd podczas czyszczenia Prisma:', error);
    return 0;
  }
}

async function cleanAll() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     🧹 CZYSZCZENIE WSZYSTKICH BAZ DANYCH                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const firebaseCount = await deleteAllFirebaseUsers();
  const prismaCount = await cleanAllPrismaTables();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ PODSUMOWANIE                           ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Firebase Authentication: ${firebaseCount} użytkowników           ║`);
  console.log(`║  Prisma/PostgreSQL:       ${prismaCount} rekordów                ║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  🎉 Wszystkie bazy danych zostały wyczyszczone!            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await prisma.$disconnect();
  process.exit(0);
}

cleanAll();

