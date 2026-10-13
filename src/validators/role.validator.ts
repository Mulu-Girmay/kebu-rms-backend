import { body, param } from 'express-validator';

export const validateRoleId = [
  param('id')
    .exists()
    .withMessage('Role ID is required')
    .bail()
    .isString()
    .withMessage('Invalid role ID')
    .bail()
    .isMongoId()
    .withMessage('Invalid role ID'),
];

export const validatePermissionId = [
  param('permissionId')
    .exists()
    .withMessage('Permission ID is required')
    .bail()
    .isString()
    .withMessage('Invalid permission ID')
    .bail()
    .isMongoId()
    .withMessage('Invalid permission ID'),
];

export const validateCreateRole = [
  body('name')
    .exists()
    .withMessage('Role name is required')
    .bail()
    .isString()
    .withMessage('Role name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Role name cannot be empty'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be a string or null')
    .bail()
    .trim(),
];

export const validateUpdateRole = [
  ...validateRoleId,

  body('name')
    .optional()
    .isString()
    .withMessage('Role name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Role name cannot be empty'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be a string or null')
    .bail()
    .trim(),
];

export const validateRolePermission = [
  ...validateRoleId,
  ...validatePermissionId,
];

export const validateRoleChange = [
  param('id')
    .exists()
    .withMessage('Target user ID is required')
    .isString()
    .withMessage('Invalid target user ID'),

  body('role_id')
    .exists()
    .withMessage('Role ID is required')
    .isString()
    .withMessage('Invalid role ID'),
];
