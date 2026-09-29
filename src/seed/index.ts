import { connectDB } from '../config/mongoose.js';
import { seedPermissions } from './permissions.js';
import { seedRoles } from './roles.js';
import { seedSuperAdmin } from './superadmin.js';

const seed = async () => {
  try {
    await connectDB();

    await seedPermissions();
    await seedRoles();
    await seedSuperAdmin();

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);

    process.exit(1);
  }
};

seed();
