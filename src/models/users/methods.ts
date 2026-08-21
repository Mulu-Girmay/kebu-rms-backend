import bcrypt from 'bcrypt';
import { userSchema } from './schema.js';

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.isActive = function (): boolean {
  return this.status === 'active';
};

userSchema.methods.verifyEmail = async function (): Promise<void> {
  this.is_email_verified = true;
  this.email_verified_at = new Date();
  this.status = 'active';

  await this.save();
};

userSchema.methods.suspend = async function (): Promise<void> {
  this.status = 'suspended';
  await this.save();
};

userSchema.methods.activate = async function (): Promise<void> {
  this.status = 'active';
  await this.save();
};

userSchema.methods.deactivate = async function (): Promise<void> {
  this.status = 'inactive';
  await this.save();
};
