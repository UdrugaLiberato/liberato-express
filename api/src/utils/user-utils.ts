import bcrypt from 'bcryptjs';

export interface UserData {
  emailAddress: string;
  username: string;
  password?: string;
  roles?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface UserUpdateData {
  emailAddress?: string;
  username?: string;
  password?: string;
  roles?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  phone?: string;
  roles: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  locations?: any[];
}

export const userInclude = {
  location: true,
};

export const userWithLocationInclude = {
  location: {
    include: {
      category: true,
    },
  },
};

export const buildUserData = async (data: UserData) => {
  const hashedPassword = data.password
    ? await bcrypt.hash(data.password, 10)
    : '';
  return {
    ...data,
    roles: data.roles || 'ROLE_USER',
    password: hashedPassword,
    createdAt: new Date(),
  };
};

export const buildUserUpdateData = async (data: UserUpdateData) => {
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  return updateData;
};

export const buildUserResponse = (user: any): UserResponse => ({
  id: user.id,
  email: user.emailAddress,
  phone: user.phone,
  roles: user.roles,
  username: user.username,
  avatar: user.avatarUrl,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  deletedAt: user.deletedAt,
  locations: user.location,
});

export const buildSimpleUserResponse = (user: any): UserResponse => ({
  id: user.id,
  email: user.emailAddress,
  phone: user.phone,
  roles: user.roles,
  username: user.username,
  avatar: user.avatarUrl,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  deletedAt: user.deletedAt,
});
