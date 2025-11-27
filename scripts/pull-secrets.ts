import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

type SecretDescriptor = {
  envKey: string;
  secretName: string;
};

const PROJECT_ID =
  process.env.GCLOUD_PROJECT ??
  process.env.FIREBASE_PROJECT_ID ??
  'm-t-m-62972';

const SECRET_ENV: SecretDescriptor[] = [
  { envKey: 'DATABASE_URL', secretName: 'database-url' },
  { envKey: 'FIREBASE_PROJECT_ID', secretName: 'firebase-project-id' },
  { envKey: 'FIREBASE_CLIENT_EMAIL', secretName: 'firebase-client-email' },
  { envKey: 'FIREBASE_PRIVATE_KEY', secretName: 'firebase-private-key' },
  { envKey: 'NEXTAUTH_SECRET', secretName: 'nextauth-secret' },
];

const STATIC_ENV: Record<string, string> = {
  NEXT_PUBLIC_BASE_URL: 'https://palkamtm.pl',
  NEXTAUTH_URL: 'https://palkamtm.pl',
  NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyCrGcWptUnRgcNnAQl01g5RjPdMfZ2tJCA',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'm-t-m-62972.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'm-t-m-62972',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'm-t-m-62972.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '714609522899',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:714609522899:web:462e995a1f358b1b0c3c26',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'G-T645E1YQHW',
  SMS_PROVIDER: 'firebase',
};

const execGcloud = (args: string[]) => {
  const result = spawnSync('gcloud', args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error(
      `gcloud ${args.join(
        ' '
      )} failed: ${result.stderr || 'unknown gcloud error'}`
    );
  }

  return result.stdout.trim();
};

const fetchSecret = (secretName: string) =>
  execGcloud([
    'secrets',
    'versions',
    'access',
    'latest',
    `--secret=${secretName}`,
    `--project=${PROJECT_ID}`,
  ]);

const formatValue = (value: string) =>
  value.includes('\n') ? `"${value.replace(/\n/g, '\\n')}"` : `"${value}"`;

const main = () => {
  const outputPath =
    process.env.ENV_OUTPUT ??
    path.join(process.cwd(), '.env.production.local');

  const envPairs: Record<string, string> = { ...STATIC_ENV };

  SECRET_ENV.forEach(({ envKey, secretName }) => {
    envPairs[envKey] = fetchSecret(secretName);
  });

  const content =
    Object.entries(envPairs)
      .map(([key, value]) => `${key}=${formatValue(value)}`)
      .join('\n') + '\n';

  fs.writeFileSync(outputPath, content, 'utf-8');

  console.log(
    `✅ Zaktualizowano ${path.relative(process.cwd(), outputPath)} na podstawie sekretów z projektu ${PROJECT_ID}.`
  );
};

main();

