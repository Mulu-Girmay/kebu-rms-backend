import { query } from 'express-validator';

export const dashboardStatsQuerySchema = [
  query('period')
    .optional()
    .isIn(['today', '7d', '30d'])
    .withMessage(
      "Invalid period parameter. Allowed values are 'today', '7d', '30d'"
    ),
];
