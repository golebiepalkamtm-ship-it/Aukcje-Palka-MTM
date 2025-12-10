import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUserByEmail(email: string) {
  if (!email) {
    console.error('Provide an email as the first argument or set DELETE_EMAIL env var');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`User with email ${email} not found.`);
    return;
  }

  console.log(`Found user: id=${user.id}, email=${user.email}, role=${user.role}`);

  // Delete user record
  await prisma.user.delete({ where: { id: user.id } });
  console.log(`Deleted user ${email} (id=${user.id}) from database.`);
}

const email = process.env.DELETE_EMAIL || process.argv[2];

deleteUserByEmail(email)
  .catch(err => {
    console.error('Error deleting user:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
