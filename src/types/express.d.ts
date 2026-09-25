import type { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      role_id: Types.ObjectId;
      status: string;
    }
  }
}

export {};
