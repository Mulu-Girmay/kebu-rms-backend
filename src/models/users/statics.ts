import { userSchema } from "./schema.js";

userSchema.statics.findByEmail =async function(email:string){
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

userSchema.statics.findByRole = function (
  roleId: string
) {
  return this.find({
    role_id: roleId,
  });
};