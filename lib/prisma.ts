import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Environment-specific database URL
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DATABASE_URL || process.env.PROD_DATABASE_URL;
  }
  if (process.env.NODE_ENV === 'test') {
    return process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  }
  return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
};

// Check if database is configured
export function isDatabaseConfigured(): boolean {
  const databaseUrl = getDatabaseUrl();
  return !!databaseUrl && !databaseUrl.includes('placeholder');
}

// Lazy initialization function to avoid Prisma initialization during build
const createPrismaClient = () => {
  const databaseUrl = getDatabaseUrl();
  
  // During build on Vercel, if DATABASE_URL is not set, use placeholder
  // This won't be used during build as Next.js doesn't execute queries during build
  const url = databaseUrl || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: url,
    errorFormat: 'pretty',
    // Disable query engine logs during Docker build
    ...(process.env.NODE_ENV === 'production' &&
      process.env.DOCKER_BUILD === 'true' && {
        log: [],
      }),
  });
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Check if database is available and throw error if not
export function requireDatabase(): void {
  if (!isDatabaseConfigured()) {
    throw new Error(
      'Database is not configured. Please set DATABASE_URL environment variable.'
    );
  }
}

// Database fallback utility function
export async function withDatabaseFallback<T>(
  dbOperation: () => Promise<T>,
  fallbackData: T,
  errorMessage?: string
): Promise<T> {
  try {
    return await dbOperation();
  } catch (error) {
    console.warn(errorMessage || 'Database operation failed, using fallback data:', error);
    return fallbackData;
  }
}
