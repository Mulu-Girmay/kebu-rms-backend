import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

// Reusable Mongoose ObjectId validator
const isValidObjectId = (value:string) => mongoose.Types.ObjectId.isValid(value);

export const validateIdParam = [
  param('id')
    .exists().withMessage('ID is required')
    .isString()
    .custom(isValidObjectId).withMessage('Invalid Mongoose ObjectId format')
];

export const validateSignUp = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),

  body('roleId')
    .exists().withMessage('Role ID is required')
    .custom(isValidObjectId).withMessage('Invalid Role ID Mongoose ObjectId format'),

  body('profileImage')
    .optional({ checkFalsy: true })
    .trim()
    .isString()
];

export const ValidateUserUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),

  body('image')
    .optional({ nullable: true })
    .trim()
    .isString(),

  body().custom((value, { req }) => {
    if (Object.keys(req.body).length === 0) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  })
];

export const validateUsersQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be an integer >= 1')
    .toInt()
    .default(1),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 }).withMessage('Limit must be an integer between 1 and 20')
    .toInt()
    .default(10),

  query('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status value'),

  query('roleId')
    .optional()
    .custom(isValidObjectId).withMessage('Invalid Role ID Mongoose ObjectId format'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search term cannot exceed 100 characters')
];

export const validateRoleUpdate = [
  body('roleId')
    .exists().withMessage('Role ID is required')
    .custom(isValidObjectId).withMessage('Invalid Role ID Mongoose ObjectId format')
];

export const validatePasswordReset = [
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters')
];
