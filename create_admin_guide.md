# Creating Admin User for Pałka MTM Platform

## Method 1: Using the Admin API (Recommended)

### Step 1: Create a user account
1. Go to your application's registration page
2. Create a new account with your desired admin email and password
3. Verify the email address

### Step 2: Get the user ID
After registration, you need the user ID from the database. You can get this by:

**Option A: Check database directly**
```sql
SELECT id, email, role FROM "User" WHERE email = 'your-admin@email.com';
```

**Option B: Use the admin users endpoint**
```bash
GET /api/admin/users
```

### Step 3: Promote to ADMIN
Use the admin API to promote the user:

```bash
PATCH /api/admin/users/{user-id}
Content-Type: application/json

{
  "role": "ADMIN"
}
```

This requires you to already have an admin token. If you don't have one yet, use Method 2.

## Method 2: Database Direct Update

If you have direct database access:

```sql
UPDATE "User" 
SET role = 'ADMIN', "isActive" = true 
WHERE email = 'your-admin@email.com';
```

## Method 3: Using Prisma Console

If you have Node.js access with the project:

```javascript
// In Node.js console or script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  const user = await prisma.user.update({
    where: { email: 'your-admin@email.com' },
    data: { role: 'ADMIN', isActive: true }
  });
  console.log('Admin created:', user);
}

createAdmin().finally(() => prisma.$disconnect());
```

## Verification

After promoting a user to ADMIN, you can verify by:

1. Login with the admin credentials
2. Check if you can access admin routes
3. Visit `/admin` dashboard (if exists)

## Security Notes

- Never expose admin credentials in plain text
- Use strong passwords for admin accounts
- Regularly audit admin users
- Consider implementing additional 2FA for admin accounts