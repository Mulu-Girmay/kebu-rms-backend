import mongoose, { Types } from 'mongoose';
import { auth } from '../config/auth.js';
import { Role } from '../models/role/index.js';
import { User } from '../models/users/index.js';
import { UserStatus } from '../utils/constants.js';
import logger from '../config/winston.js';

export interface SeedSuperAdminOptions {
  name?: string;
  email?: string;
  password?: string;
}

export const seedSuperAdmin = async (
  options: SeedSuperAdminOptions = {}
): Promise<void> => {
  const name = options.name || process.env.SUPERADMIN_NAME || 'Super Admin';
  const email = (
    options.email ||
    process.env.SUPERADMIN_EMAIL ||
    'adminuser@example.com'
  ).toLowerCase();
  const password =
    options.password || process.env.SUPERADMIN_PASSWORD || 'Admin@123456';

  const superAdminRole = await Role.findOne({ name: 'super_admin' });
  if (!superAdminRole) {
    throw new Error(
      "The 'super_admin' role was not found. Please ensure seedRoles() runs first."
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.role_id?.toString() === superAdminRole._id.toString()) {
      console.log(
        `Super admin already exists with email: ${email} (Role: super_admin)`
      );
      return;
    }

    await User.updateOne(
      { _id: existingUser._id },
      {
        $set: {
          role_id: superAdminRole._id.toString(),
          emailVerified: true,
          status: UserStatus.ACTIVE,
        },
      }
    );

    console.log(
      `Existing user ${email} successfully promoted to super_admin role.`
    );
    return;
  }

  const ctx = await auth.$context;
  const userId = `user_${new Types.ObjectId().toString()}`;
  const hashedPassword = await ctx.password.hash(password);

  let createdUserId: string | null = null;

  try {
    console.log(`Creating fresh verified Super Admin context for ${email}...`);

    const user = await ctx.internalAdapter.createUser(
      {
        id: userId,
        _id: userId,
        name,
        email,
        emailVerified: true,
        role_id: superAdminRole._id.toString(),
        status: 'active',
        must_change_password: false,
        settings: {
          orderStatusNotifications: 'all',
          promotionalNotifications: false,
          pushNotificaitons: false,
        },
      },
      { method: 'signup' }
    );
    createdUserId = user.id;

    await ctx.internalAdapter.createAccount({
      userId: user.id,
      accountId: user.id,
      issuer: 'local:credential',
      providerId: 'credential',
      password: hashedPassword,
    });

    console.log('----------------------------------------------------');
    console.log('Super Admin user created successfully via Adapter:');
    console.log(`  ID:       ${user.id}`);
    console.log(`  Name:     ${name}`);
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role:     super_admin (${superAdminRole._id})`);
    console.log(`  Status:   active (emailVerified: true)`);
    console.log('----------------------------------------------------');
  } catch (error) {
    if (createdUserId) {
      try {
        await ctx.internalAdapter.deleteUser(createdUserId);
        logger.warn(`Rolled back admin user creation for ${createdUserId}`);
      } catch (cleanupError) {
        logger.error(
          `Failed to clean up after user creation failure for ${createdUserId}`,
          cleanupError
        );
      }
    }
    throw error;
  }
};

const isDirectRun =
  process.argv[1]?.endsWith('superadmin.ts') ||
  process.argv[1]?.endsWith('superadmin.js');

if (isDirectRun) {
  (async () => {
    try {
      const { connectDB } = await import('../config/mongoose.js');
      await connectDB();
      await seedSuperAdmin();
      process.exit(0);
    } catch (error) {
      console.error('Super admin seeding failed:', error);
      process.exit(1);
    }
  })();
}
