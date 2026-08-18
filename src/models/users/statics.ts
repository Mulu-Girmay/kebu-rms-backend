import { userSchema } from "./schema.js";
import type { InferSchemaType } from "mongoose";
import type {User} from './index.js'

userSchema.statics.findByEmail =async function(email:string): Promise<User | null> {
    return await this.findOne({email: email.toLocaleLowerCase()});
};

userSchema.statics.emailExists = async function(email:string):Promise<boolean>{
    const result = await this.exists({email: email.toLocaleLowerCase()})
    return !!result
} 

userSchema.statics.findByActiveId = async function (userId:string) {
  return this.findOne({
    _id: userId,
    status: "active",
  });    
}

userSchema.statics.findByRole = function (roleId: string): Promise<User[]>  {
  return this.find({
    role_id: roleId,
  });
};