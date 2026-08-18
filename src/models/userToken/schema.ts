import { required, string } from "joi";
import { Schema } from "mongoose";

export const userTokenSchema = new Schema(
    {
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    type:{
        type:String,
        enum:[
            "email_verification",
            "password_reset",
        ],
        required: true,
    },
    token_hash: {
        type: String,
        required:true,
        unique: true,
    },
    expires_at:{
        type: Date,
        required: true,
        index: true,
    },
    used_at: {
        type: Date,
        default: null,
    },
},
{
    timestamps:{
        createdAt: "created_at",
        updatedAt: false,
    },
}
);
userTokenSchema.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0 }
);