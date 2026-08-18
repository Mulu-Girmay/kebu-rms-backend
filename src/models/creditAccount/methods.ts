import { creditAccountSchema } from "./schema.js";

creditAccountSchema.methods.getAvailableCredit = function (): number {
  return Math.max(this.creditLimit - this.usedCredit, 0);
};

creditAccountSchema.methods.hasAvailableCredit = function (
  amount: number,
): boolean {
  if (amount < 0) {
    return false;
  }

  return (
    this.status === "active" &&
    this.usedCredit + amount <= this.creditLimit
  );
};