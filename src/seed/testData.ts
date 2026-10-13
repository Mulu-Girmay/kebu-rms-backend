import mongoose from 'mongoose';
import { connectDB } from '../config/mongoose.js';
import logger from '../config/winston.js';
import { Category } from '../models/categories/index.js';
import { MenuItem } from '../models/menuItems/index.js';
import { User } from '../models/users/index.js';
import { UserStatus } from '../utils/constants.js';

const categories = [
  {
    name: 'API Test - Breakfast',
    description: 'Breakfast items for API testing',
    isActive: true,
  },
  {
    name: 'API Test - Lunch',
    description: 'Lunch items for API testing',
    isActive: true,
  },
  {
    name: 'API Test - Beverages',
    description: 'Beverages for API testing',
    isActive: true,
  },
  {
    name: 'API Test - Inactive',
    description: 'Inactive category for API testing',
    isActive: false,
  },
];

const menuItems = [
  {
    name: 'API Test - Scrambled Eggs',
    categoryName: 'API Test - Breakfast',
    description: 'Scrambled eggs served with toast',
    price: 120,
    isAvailable: true,
    favoriteCount: 12,
  },
  {
    name: 'API Test - Oatmeal',
    categoryName: 'API Test - Breakfast',
    description: 'Warm oatmeal with fruit',
    price: 85,
    isAvailable: true,
    favoriteCount: 5,
  },
  {
    name: 'API Test - Grilled Chicken',
    categoryName: 'API Test - Lunch',
    description: 'Grilled chicken with rice and vegetables',
    price: 240,
    isAvailable: true,
    favoriteCount: 20,
  },
  {
    name: 'API Test - Veggie Wrap',
    categoryName: 'API Test - Lunch',
    description: 'Vegetable wrap with a side salad',
    price: 175,
    isAvailable: false,
    favoriteCount: 3,
  },
  {
    name: 'API Test - Mango Juice',
    categoryName: 'API Test - Beverages',
    description: 'Fresh mango juice',
    price: 65,
    isAvailable: true,
    favoriteCount: 9,
  },
];

const seedTestData = async (): Promise<void> => {
  await connectDB();

  try {
    const categoryIds = new Map<string, mongoose.Types.ObjectId>();

    for (const category of categories) {
      const seededCategory = await Category.findOneAndUpdate(
        { name: category.name },
        { $set: category },
        { upsert: true, new: true, runValidators: true }
      );

      if (!seededCategory) {
        throw new Error(`Failed to seed category "${category.name}"`);
      }

      categoryIds.set(category.name, seededCategory._id);
    }

    for (const menuItem of menuItems) {
      const categoryId = categoryIds.get(menuItem.categoryName);

      if (!categoryId) {
        throw new Error(
          `Category "${menuItem.categoryName}" was not seeded before its menu item`
        );
      }

      const menuItemData = {
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        isAvailable: menuItem.isAvailable,
        favoriteCount: menuItem.favoriteCount,
      };
      await MenuItem.findOneAndUpdate(
        { name: menuItem.name, categoryId },
        { $set: { ...menuItemData, categoryId } },
        { upsert: true, new: true, runValidators: true }
      );
    }

    logger.info('API test data seeded successfully');
  } finally {
    await mongoose.disconnect();
  }
};

seedTestData().catch((error: unknown) => {
  logger.error(
    `API test data seeding failed: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`
  );
  process.exitCode = 1;
});
