export default class CoordinatesNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CoordinatesNotFound';

    // Fix prototype chain for proper instanceof checks
    Object.setPrototypeOf(this, CoordinatesNotFound.prototype);

    // Capture stack trace if available (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
