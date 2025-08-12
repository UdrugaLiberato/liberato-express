import prisma from '../config/prisma';
import { clerkClient, DeletedObjectJSON, WebhookEvent } from '@clerk/express';

export interface ClerkUser {
  id: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  username?: string;
  image_url?: string;
  first_name?: string;
  last_name?: string;
  created_at: number;
  updated_at: number;
  last_sign_in_at?: number;
  last_active_at?: number;
  banned: boolean;
}

export const syncUserFromClerk = async (clerkUser: ClerkUser) => {
  const primaryEmail = clerkUser.email_addresses.find(
    (email) => email.email_address,
  )?.email_address;

  if (!primaryEmail) {
    throw new Error('User must have an email address');
  }

  await clerkClient.users.updateUserMetadata(clerkUser.id, {
    publicMetadata: {
      role: 'user',
    },
  });
  const userData = {
    clerkId: clerkUser.id,
    emailAddress: primaryEmail,
    username:
      clerkUser.username || clerkUser.first_name || primaryEmail.split('@')[0],
    roles: 'user',
    avatarUrl: clerkUser.image_url,
    lastSignInAt: clerkUser.last_sign_in_at
      ? BigInt(clerkUser.last_sign_in_at)
      : null,
    lastActiveAt: clerkUser.last_active_at
      ? BigInt(clerkUser.last_active_at)
      : null,
    banned: clerkUser.banned,
    createdAt: new Date(clerkUser.created_at),
    updatedAt: new Date(clerkUser.updated_at),
  };

  // First, check if a user exists with this email but no externalId
  const existingUserByEmail = await prisma.user.findUnique({
    where: { emailAddress: userData.emailAddress },
  });

  if (existingUserByEmail && !existingUserByEmail.clerkId) {
    // Update existing user to link with Clerk
    return prisma.user.update({
      where: { emailAddress: userData.emailAddress },
      data: {
        clerkId: userData.clerkId,
        username: userData.username,
        avatarUrl: userData.avatarUrl,
        lastSignInAt: userData.lastSignInAt,
        lastActiveAt: userData.lastActiveAt,
        banned: userData.banned,
        updatedAt: userData.updatedAt,
      },
    });
  }

  // Use normal upsert for Clerk-managed users
  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    create: userData,
    update: {
      emailAddress: userData.emailAddress,
      username: userData.username,
      avatarUrl: userData.avatarUrl,
      lastSignInAt: userData.lastSignInAt,
      lastActiveAt: userData.lastActiveAt,
      banned: userData.banned,
      updatedAt: userData.updatedAt,
    },
  });
};

export const deleteUserByClerkId = async (clerkId: string) => {
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new Error(`User with Clerk ID ${clerkId} not found`);
  }

  return prisma.user.update({
    where: { clerkId },
    data: { deletedAt: new Date() },
  });
};

export const handleUserCreated = async (evt: WebhookEvent) => {
  if (evt.type === 'user.created') {
    const clerkUser = evt.data as ClerkUser;
    return syncUserFromClerk(clerkUser);
  }
  throw new Error('Invalid event type for user.created handler');
};

export const handleUserUpdated = async (evt: WebhookEvent) => {
  if (evt.type === 'user.updated') {
    const clerkUser = evt.data as ClerkUser;
    return syncUserFromClerk(clerkUser);
  }
  throw new Error('Invalid event type for user.updated handler');
};

export const handleUserDeleted = async (evt: WebhookEvent) => {
  if (evt.type === 'user.deleted') {
    const clerkUser = evt.data as DeletedObjectJSON;
    return deleteUserByClerkId(clerkUser.id as string);
  }
  throw new Error('Invalid event type for user.deleted handler');
};

export const handleSessionCreated = async (evt: WebhookEvent) => {
  if (evt.type === 'session.created') {
    console.log('Session created:', evt.data);
    const sessionId = (evt.data as any).id;
    const userId = (evt.data as any).user_id;

    if (userId) {
      await prisma.user
        .update({
          where: { clerkId: userId },
          data: { lastActiveAt: BigInt(Date.now()) },
        })
        .catch((error) =>
          console.warn('Could not update user last active:', error),
        );
    }

    return { sessionId, userId, action: 'created' };
  }
  throw new Error('Invalid event type for session.created handler');
};

export const handleSessionEnded = async (evt: WebhookEvent) => {
  if (evt.type === 'session.ended') {
    console.log('Session ended:', evt.data);
    const sessionId = (evt.data as any).id;
    const userId = (evt.data as any).user_id;
    return { sessionId, userId, action: 'ended' };
  }
  throw new Error('Invalid event type for session.ended handler');
};

export const handleSessionRevoked = async (evt: WebhookEvent) => {
  if (evt.type === 'session.revoked') {
    console.log('Session revoked:', evt.data);
    const sessionId = (evt.data as any).id;
    const userId = (evt.data as any).user_id;
    return { sessionId, userId, action: 'revoked' };
  }
  throw new Error('Invalid event type for session.revoked handler');
};

export const handleSessionRemoved = async (evt: WebhookEvent) => {
  if (evt.type === 'session.removed') {
    console.log('Session removed:', evt.data);
    const sessionId = (evt.data as any).id;
    const userId = (evt.data as any).user_id;
    return { sessionId, userId, action: 'removed' };
  }
  throw new Error('Invalid event type for session.removed handler');
};

export const handleRoleCreated = async (evt: WebhookEvent) => {
  if (evt.type === 'role.created') {
    console.log('Role created:', evt.data);
    const roleId = (evt.data as any).id;
    const roleName = (evt.data as any).name;
    return { roleId, roleName, action: 'created' };
  }
  throw new Error('Invalid event type for role.created handler');
};

export const handleRoleUpdated = async (evt: WebhookEvent) => {
  if (evt.type === 'role.updated') {
    console.log('Role updated:', evt.data);
    const roleId = (evt.data as any).id;
    const roleName = (evt.data as any).name;
    return { roleId, roleName, action: 'updated' };
  }
  throw new Error('Invalid event type for role.updated handler');
};

export const handleRoleDeleted = async (evt: WebhookEvent) => {
  if (evt.type === 'role.deleted') {
    console.log('Role deleted:', evt.data);
    const roleId = (evt.data as any).id;
    return { roleId, action: 'deleted' };
  }
  throw new Error('Invalid event type for role.deleted handler');
};
