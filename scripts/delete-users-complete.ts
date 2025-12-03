/**
 * SKRYPT USUWANIA WSZYSTKICH UŻYTKOWNIKÓW
 * ⚠️ UWAGA: Operacja nieodwracalna!
 * Usuwa użytkowników z PostgreSQL (Prisma) i Firebase
 *
 * Użycie: npx tsx scripts/delete-users-complete.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function deleteAllUsersFromDatabase() {
  console.log('🗄️ Usuwanie użytkowników z bazy PostgreSQL...\n');

  try {
    // Najpierw usuń powiązane dane (kaskadowe usuwanie)
    // Te tabele mają relacje z User
    
    console.log('   Usuwanie WatchlistItems...');
    await prisma.watchlistItem.deleteMany({});
    
    console.log('   Usuwanie Messages...');
    await prisma.message.deleteMany({});
    
    console.log('   Usuwanie UserMessages...');
    await prisma.userMessage.deleteMany({});
    
    console.log('   Usuwanie Conversations...');
    await prisma.conversation.deleteMany({});
    
    console.log('   Usuwanie Bids...');
    await prisma.bid.deleteMany({});
    
    console.log('   Usuwanie Reviews...');
    await prisma.review.deleteMany({});
    
    console.log('   Usuwanie UserRatings...');
    await prisma.userRating.deleteMany({});
    
    console.log('   Usuwanie Transactions...');
    await prisma.transaction.deleteMany({});
    
    console.log('   Usuwanie AuctionAssets...');
    await prisma.auctionAsset.deleteMany({});
    
    console.log('   Usuwanie Auctions...');
    await prisma.auction.deleteMany({});
    
    console.log('   Usuwanie BreederMeetings...');
    await prisma.breederMeeting.deleteMany({});
    
    console.log('   Usuwanie Notifications...');
    await prisma.notification.deleteMany({});
    
    console.log('   Usuwanie PushSubscriptions...');
    await prisma.pushSubscription.deleteMany({});
    
    console.log('   Usuwanie Accounts...');
    await prisma.account.deleteMany({});
    
    console.log('   Usuwanie Sessions...');
    await prisma.session.deleteMany({});
    
    // Na końcu usuń użytkowników
    console.log('   Usuwanie Users...');
    const result = await prisma.user.deleteMany({});
    
    console.log(`\n✅ Usunięto ${result.count} użytkowników z bazy PostgreSQL!\n`);
    return result.count;
  } catch (error) {
    console.error('❌ Błąd podczas usuwania użytkowników z PostgreSQL:', error);
    throw error;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       USUWANIE WSZYSTKICH UŻYTKOWNIKÓW                    ');
  console.log('═══════════════════════════════════════════════════════════\n');

  const deletedCount = await deleteAllUsersFromDatabase();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  PODSUMOWANIE: Usunięto ${deletedCount} użytkowników z DB`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('⚠️  Aby usunąć użytkowników z Firebase, uruchom:');
  console.log('    npx tsx scripts/delete-all-users.ts');
  console.log('    (wymaga pliku firebase-key.json)\n');
}

main()
  .then(() => {
    console.log('🎉 Operacja zakończona pomyślnie.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Krytyczny błąd:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });