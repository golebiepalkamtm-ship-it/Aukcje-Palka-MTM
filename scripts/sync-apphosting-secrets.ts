import { spawnSync } from 'node:child_process';
import { config as loadEnv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

type UpsertResult = {
  status: number;
  stderr: string;
};

const DEFAULT_PROJECT_ID = 'm-t-m-62972';
const DATABASE_SECRET = process.env.DATABASE_SECRET_NAME ?? 'database-url';
const ENV_PATH_CANDIDATES = [
  process.env.SECRET_ENV_PATH,
  '.env.production.local',
  'env.production.local',
  '.env.production',
  'env.production',
  '.env',
  'env',
].filter(Boolean) as string[];

const resolveEnvFile = () => {
  for (const candidate of ENV_PATH_CANDIDATES) {
    const filePath = path.isAbsolute(candidate)
      ? candidate
      : path.join(process.cwd(), candidate);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  throw new Error(
    `Brak pliku ze zmiennymi środowiskowymi. Utwórz np. '.env.production.local' z prawidłowym DATABASE_URL.`
  );
};

const ensureDatabaseUrl = () => {
  const envFile = resolveEnvFile();
  loadEnv({ path: envFile });

  const url =
    process.env.DATABASE_URL ??
    process.env.PROD_DATABASE_URL ??
    process.env.CLOUD_SQL_DATABASE_URL;

  if (!url) {
    throw new Error(
      `Nie znaleziono DATABASE_URL w ${envFile}. Dodaj postgresql://...`
    );
  }

  const normalized = url.trim();
  if (!normalized.toLowerCase().startsWith('postgresql://')) {
    throw new Error(
      `DATABASE_URL ma niepoprawny format. Oczekiwano postgresql://user:pass@host:port/db?...`
    );
  }

  return normalized;
};

const runCommand = (
  cmd: string,
  args: string[],
  input?: string
): UpsertResult => {
  const result = spawnSync(cmd, args, {
    input,
    stdio: ['pipe', 'inherit', 'pipe'],
    encoding: 'utf-8',
    shell: process.platform === 'win32',
  });

  return {
    status: result.status ?? 1,
    stderr: result.stderr ?? result.error?.message ?? '',
  };
};

const upsertSecret = (projectId: string, value: string) => {
  const describe = runCommand('gcloud', [
    'secrets',
    'describe',
    DATABASE_SECRET,
    `--project=${projectId}`,
  ]);

  if (describe.status !== 0) {
    console.error(
      `[sync] describe failed (status=${describe.status}): ${describe.stderr}`
    );
    const create = runCommand(
      'gcloud',
      [
        'secrets',
        'create',
        DATABASE_SECRET,
        '--replication-policy=automatic',
        '--data-file=-',
        `--project=${projectId}`,
      ],
      value
    );

    if (create.status !== 0) {
      throw new Error(
        `Nie udało się utworzyć secreta ${DATABASE_SECRET}: ${create.stderr}`
      );
    }
    return;
  }

  const addVersion = runCommand(
    'gcloud',
    [
      'secrets',
      'versions',
      'add',
      DATABASE_SECRET,
      '--data-file=-',
      `--project=${projectId}`,
    ],
    value
  );

  if (addVersion.status !== 0) {
    throw new Error(
      `Nie udało się zaktualizować secreta ${DATABASE_SECRET}: ${addVersion.stderr}`
    );
  }
};

const main = () => {
  const databaseUrl = ensureDatabaseUrl();
  const projectId =
    process.env.GCLOUD_PROJECT ??
    process.env.FIREBASE_PROJECT_ID ??
    DEFAULT_PROJECT_ID;

  upsertSecret(projectId, databaseUrl);
  console.log(
    `✅ Zsynchronizowano secret '${DATABASE_SECRET}' w projekcie '${projectId}'.`
  );
};

main();

