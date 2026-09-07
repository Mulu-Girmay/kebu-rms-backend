import { connectDB } from '../config/mongoose.js';
import { seedPermissions } from './permissions.js';
import { seedRoles } from './roles.js';

const seed = async () => {
  try {
    await connectDB();

    await seedPermissions();
    await seedRoles();

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);

    process.exit(1);
  }
};

seed();
