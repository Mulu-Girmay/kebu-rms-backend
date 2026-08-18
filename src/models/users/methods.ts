import bcrypt from 'bcrypt';
import { userSchema } from './schema.js';

userSchema.methods.comparePassword = async function( password: string ):Promise<boolean>{
   return bcrypt.compare(password, this.password)
}

userSchema.methods.isActive = function (): boolean {
  return this.status === "active";
};