import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const categoryIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid category ID format',
  }),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Category name is required',
    'string.empty': 'Category name cannot be empty',
  }),
  description: Joi.string().trim().allow('').optional(),
  imageUrl: Joi.string().trim().allow('', null).optional(),
  isActive: Joi.boolean().default(true),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().allow('').optional(),
  imageUrl: Joi.string().trim().allow('', null).optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided to update',
  });

export const categoryQuerySchema = Joi.object({
  isActive: Joi.boolean().optional(),
});
