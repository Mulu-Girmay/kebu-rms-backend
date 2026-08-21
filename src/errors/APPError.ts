export default class APPError extends Error {
  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
