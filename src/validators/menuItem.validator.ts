import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const menuItemIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid menu item ID format',
  }),
});

export const createMenuItemSchema = Joi.object({
  categoryId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Category ID is required',
    'string.pattern.base': 'Invalid Category ID format',
  }),
  name: Joi.string().trim().min(2).max(150).required().messages({
    'any.required': 'Menu item name is required',
    'string.empty': 'Menu item name cannot be empty',
  }),
  description: Joi.string().trim().allow('').optional(),
  price: Joi.number().min(0).required().messages({
    'any.required': 'Price is required',
    'number.min': 'Price cannot be negative',
  }),
  imageUrl: Joi.string().trim().allow('', null).optional(),
  isAvailable: Joi.boolean().default(true),
});

export const updateMenuItemSchema = Joi.object({
  categoryId: Joi.string().pattern(objectIdPattern).optional().messages({
    'string.pattern.base': 'Invalid Category ID format',
  }),
  name: Joi.string().trim().min(2).max(150).optional(),
  description: Joi.string().trim().allow('').optional(),
  price: Joi.number().min(0).optional(),
  imageUrl: Joi.string().trim().allow('', null).optional(),
  isAvailable: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided to update',
  });

export const toggleAvailabilitySchema = Joi.object({
  isAvailable: Joi.boolean().required().messages({
    'any.required': 'isAvailable boolean is required',
  }),
});

export const menuItemQuerySchema = Joi.object({
  q: Joi.string().trim().allow('').optional(),
  categoryId: Joi.string().pattern(objectIdPattern).optional(),
  isAvailable: Joi.boolean().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid('name', 'price', 'createdAt', 'favoriteCount')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
