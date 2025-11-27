import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCounts() {
  try {
    const counts = {
      User: await prisma.user.count(),
      Auction: await prisma.auction.count(),
      Bid: await prisma.bid.count(),
      Pigeon: await prisma.pigeon.count(),
      Account: await prisma.account.count(),
      Session: await prisma.session.count(),
      BreederMeeting: await prisma.breederMeeting.count(),
      Reference: await prisma.reference.count(),
      Message: await prisma.message.count(),
      Conversation: await prisma.conversation.count(),
      Transaction: await prisma.transaction.count(),
      Review: await prisma.review.count(),
      Notification: await prisma.notification.count(),
    };

    console.log('\n📊 LICZBA REKORDÓW W BAZIE:\n');
    let total = 0;
    for (const [table, count] of Object.entries(counts)) {
      if (count > 0) {
        console.log(`  ${table}: ${count} rekordów`);
        total += count;
      }
    }
    
    if (total === 0) {
      console.log('  ✅ Wszystkie tabele są puste');
    } else {
      console.log(`\n  ⚠️  Łącznie: ${total} rekordów w bazie`);
    }
  } catch (error) {
    console.error('❌ Błąd:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();

