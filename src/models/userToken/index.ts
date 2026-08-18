import mongoose from "mongoose";
import { userTokenSchema } from "./schema.js";
import type { InferSchemaType, Model } from "mongoose";

export type UserToken = InferSchemaType<typeof userTokenSchema>

export interface UserTokenMethods {
    isExpired():boolean;
    isUsed():boolean;
    markAsUsed():Promise<void>
}

export interface UserTokenModel
    extends Model<UserToken, {}, UserTokenMethods>{
    findValidByTokenHash(tokenHash: string): Promise<UserToken | null>;
    findByUserId(userId: string): Promise<UserToken[]>;
    invalidateForUser(userId: string): Promise<any>;
}

export const UserToken = mongoose.model<UserToken, UserTokenModel>("UserToken", userTokenSchema)
