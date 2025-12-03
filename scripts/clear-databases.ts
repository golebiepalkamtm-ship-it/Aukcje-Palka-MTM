/**
 * Script to clear Firebase Auth users and Prisma (PostgreSQL) database
 * Run with: npx ts-node --esm scripts/clear-databases.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

function initFirebaseAdmin(): Auth | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.log('  ⚠ Firebase credentials not found in .env.local:');
    console.log(`    - FIREBASE_PROJECT_ID: ${projectId ? 'SET' : 'NOT SET'}`);
    console.log(`    - FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'SET' : 'NOT SET'}`);
    console.log(`    - FIREBASE_PRIVATE_KEY: ${privateKey ? 'SET' : 'NOT SET'}`);
    return null;
  }

  try {
    const normalizedPrivateKey = privateKey
      .replace(/^["']|["']$/g, '')
      .replace(/\\\\n/g, '\n')
      .replace(/\\n/g, '\n');

    let app: App;
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey: normalizedPrivateKey }),
      });
    } else {
      app = getApps()[0];
    }
    return getAuth(app);
  } catch (error: any) {
    console.log('  ❌ Firebase init error:', error.message);
    return null;
  }
}

async function clearFirebaseUsers() {
  console.log('🔥 Clearing Firebase Auth users...');
  
  const auth = initFirebaseAdmin();
  if (!auth) return;

  let nextPageToken: string | undefined;
  let totalDeleted = 0;

  try {
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);

      if (listUsersResult.users.length === 0) {
        console.log('  No Firebase users found.');
        break;
      }

      const uids = listUsersResult.users.map((user: any) => user.uid);
      const deleteResult = await auth.deleteUsers(uids);
      totalDeleted += deleteResult.successCount;

      if (deleteResult.failureCount > 0) {
        console.log(`  ⚠ Failed to delete ${deleteResult.failureCount} users`);
      }

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`  ✅ Deleted ${totalDeleted} Firebase users`);
  } catch (error: any) {
    console.error('  ❌ Error:', error.message);
  }
}

async function clearPrismaDatabase() {
  console.log('🗄️  Clearing Prisma (PostgreSQL) database...');
  
  const tables = ['message', 'bid', 'auction', 'reference', 'session', 'user'];

  for (const table of tables) {
    try {
      const result = await (prisma as any)[table]?.deleteMany({});
      if (result !== undefined) {
        console.log(`  ✅ Deleted ${result.count} rows from ${table}`);
      }
    } catch (e: any) {
      if (!e.message?.includes('does not exist')) {
        console.log(`  ⚠ ${table}: ${e.message}`);
      }
    }
  }
  console.log('  ✅ Prisma database cleared');
}

async function main() {
  console.log('\n========================================');
  console.log('  DATABASE CLEANUP SCRIPT');
  console.log('========================================\n');

  await clearPrismaDatabase();
  await clearFirebaseUsers();

  console.log('\n========================================');
  console.log('  CLEANUP COMPLETE');
  console.log('========================================\n');

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});