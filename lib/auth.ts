import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  // Try to find user in database
  let user = await db.user.findUnique({
    where: { clerkId },
    include: {
      profile: true,
    },
  });

  // Fallback: If user doesn't exist in DB but is authenticated with Clerk,
  // create them now (in case webhook wasn't set up or failed)
  if (!user) {
    console.log('[AUTH] User not found in DB, attempting fallback creation for clerkId:', clerkId);

    try {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        console.error('[AUTH] Could not fetch Clerk user data');
        return null;
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        console.error('[AUTH] Clerk user has no email address');
        return null;
      }

      user = await db.user.create({
        data: {
          clerkId,
          email,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
          avatar: clerkUser.imageUrl,
        },
        include: {
          profile: true,
        },
      });

      console.log('[AUTH] ✅ User created via fallback:', { id: user.id, clerkId });
    } catch (error) {
      console.error('[AUTH] ❌ Failed to create user via fallback:', error);
      return null;
    }
  }

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
