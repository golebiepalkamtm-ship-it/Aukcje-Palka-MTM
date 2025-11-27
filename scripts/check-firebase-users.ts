import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Brak konfiguracji Firebase Admin SDK!');
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

async function checkUsers() {
  try {
    const users = await auth.listUsers(100);
    console.log(`\n🔥 Firebase Authentication - Użytkownicy:\n`);
    console.log(`   Łącznie: ${users.users.length} użytkowników\n`);
    
    if (users.users.length === 0) {
      console.log('   ✅ Brak użytkowników w Firebase\n');
    } else {
      users.users.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email || '(brak email)'}`);
        console.log(`      UID: ${u.uid}`);
        console.log(`      Email Verified: ${u.emailVerified}`);
        console.log(`      Disabled: ${u.disabled}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Błąd:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers();

