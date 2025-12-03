import 'dotenv/config';
import { getAdminAuth } from '@/lib/firebase-admin';
import { error as logError } from '@/lib/logger';

async function cleanFirebaseUsers() {
  console.log('🔍 CZYSZCZENIE FIREBASE USERS - LIST MODE');
  
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    console.error('❌ Firebase Admin NIE zainicjalizowany! Sprawdź .env.local');
    console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    return;
  }

  try {
    const listUsersResult = await adminAuth.listUsers(1000, 0);
    console.log(`\n📊 Znaleziono ${listUsersResult.users.length} users w Firebase Auth:`);
    
    listUsersResult.users.forEach((userRecord, i) => {
      console.log(`${i+1}. UID: ${userRecord.uid.padEnd(32)} | Email: ${userRecord.email || 'BRAK'} | Verified: ${userRecord.emailVerified} | Created: ${userRecord.metadata.creationTime}`);
    });

    if (listUsersResult.pageToken) {
      console.log('\n⚠️ Więcej users (>1000) - uruchom ponownie z nextPageToken');
    }

    console.log('\n🚨 ABY USUNĄĆ WSZYSTKICH: Odkomentuj blok poniżej i uruchom ponownie');
    console.log('// const deletePromises = listUsersResult.users.map(u => adminAuth.deleteUser(u.uid));');
    console.log('// await Promise.all(deletePromises);');
    console.log('// console.log("✅ USUNIĘTO WSZYSTKICH!");');

  } catch (error) {
    logError('Błąd listUsers:', error);
  }
}

cleanFirebaseUsers().catch(console.error);
