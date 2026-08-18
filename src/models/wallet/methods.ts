import { walletSchema } from "./schema.js";

walletSchema.methods.hasSufficientBalance = function (
  amount: number,
): boolean {
  if (amount < 0) {
    return false;
  }

  return this.balance >= amount;
};

walletSchema.methods.isActive = function (): boolean {
  return this.isActive;
};

walletSchema.methods.canDebit = function (
  amount: number,
): boolean {
  return (
    this.isActive &&
    amount > 0 &&
    this.balance >= amount
  );
};