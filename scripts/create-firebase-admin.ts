import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { PrismaClient, Role } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
console.log('Loading .env...');
config({ path: resolve(process.cwd(), '.env') });
console.log('DATABASE_URL after .env:', process.env.DATABASE_URL);
console.log('Loading .env.local...');
config({ path: resolve(process.cwd(), '.env.local') });
console.log('DATABASE_URL after .env.local:', process.env.DATABASE_URL);

// Override for Cloud SQL
process.env.DATABASE_URL = 'postgresql://MTM:Milosz1205@34.6.153.213:5432/palka_core_prod?connect_timeout=5&pool_timeout=30&statement_timeout=60000';
console.log('DATABASE_URL after override:', process.env.DATABASE_URL);

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

initializeApp({
  credential: cert(serviceAccount as any),
});

const auth = getAuth();
const prisma = new PrismaClient();

async function createFirebaseAdmin() {
  const email = 'admin@palka-mtm.pl';
  const password = 'Milosz1205';
  
  console.log('🔧 Tworzenie konta administratora...');
  console.log(`   Email: ${email}`);
  
  try {
    // Sprawdź czy użytkownik już istnieje w Firebase
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email);
      console.log('⚠️  Użytkownik już istnieje w Firebase. Aktualizuję hasło...');
      
      // Aktualizuj hasło istniejącego użytkownika
      firebaseUser = await auth.updateUser(firebaseUser.uid, {
        password: password,
        emailVerified: true,
      });
      console.log('✅ Hasło zaktualizowane!');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Utwórz nowego użytkownika w Firebase
        console.log('📝 Tworzę nowego użytkownika w Firebase...');
        firebaseUser = await auth.createUser({
          email: email,
          password: password,
          emailVerified: true,
          displayName: 'Admin System',
        });
        console.log('✅ Użytkownik utworzony w Firebase!');
      } else {
        throw error;
      }
    }
    
    console.log(`   Firebase UID: ${firebaseUser.uid}`);
    
    // Ustaw custom claims dla admina
    await auth.setCustomUserClaims(firebaseUser.uid, {
      role: 'ADMIN',
    });
    console.log('✅ Custom claims ustawione (role: ADMIN)');
    
    // Teraz zaktualizuj bazę danych Prisma
    console.log('📝 Aktualizuję bazę danych Prisma...');
    
    try {
      // Sprawdź czy użytkownik istnieje w bazie
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        // Aktualizuj istniejącego użytkownika
        await prisma.user.update({
          where: { email },
          data: {
            firebaseUid: firebaseUser.uid,
            role: Role.ADMIN,
            isActive: true,
            emailVerified: new Date(),
            isProfileVerified: true,
          },
        });
        console.log('✅ Użytkownik zaktualizowany w bazie danych!');
      } else {
        // Utwórz nowego użytkownika
        await prisma.user.create({
          data: {
            firebaseUid: firebaseUser.uid,
            email: email,
            firstName: 'Admin',
            lastName: 'System',
            role: Role.ADMIN,
            isActive: true,
            emailVerified: new Date(),
            isProfileVerified: true,
          },
        });
        console.log('✅ Użytkownik utworzony w bazie danych!');
      }
    } catch (dbError: any) {
      console.error('❌ Błąd bazy danych:', dbError.message || dbError);
      console.log('⚠️  Nie można zaktualizować bazy danych (może być niedostępna)');
      console.log('   Firebase Auth zostało zaktualizowane, możesz się zalogować.');
    }
    
    console.log('\n========================================');
    console.log('🎉 GOTOWE! Dane logowania administratora:');
    console.log('========================================');
    console.log(`   Email:    ${email}`);
    console.log(`   Hasło:    ${password}`);
    console.log(`   UID:      ${firebaseUser.uid}`);
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ Błąd:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFirebaseAdmin();