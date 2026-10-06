import { auth } from '../config/auth.js';
import { Role } from '../models/role/index.js';
import { User } from '../models/users/index.js';
import { UserStatus } from '../utils/constants.js';

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
    'admin@example.com'
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

  // Sign up user via Better Auth to create user record and hashed password account
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
  } catch (error: unknown) {
    // If user already exists in auth provider, proceed to update role
    const message = error instanceof Error ? error.message : String(error);
    console.warn('Better Auth sign-up notice:', message);
  }

  // Update newly registered user to super_admin role and mark as verified
  const createdUser = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        role_id: superAdminRole._id.toString(),
        emailVerified: true,
        status: UserStatus.ACTIVE,
      },
    },
    { new: true }
  );

  if (!createdUser) {
    throw new Error(
      `Failed to find or update created user with email: ${email}`
    );
  }

  console.log('----------------------------------------------------');
  console.log('Super Admin user created successfully:');
  console.log(`  Name:     ${name}`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role:     super_admin (${superAdminRole._id})`);
  console.log(`  Status:   active (emailVerified: true)`);
  console.log('----------------------------------------------------');
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
