export class UnauthorizedError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message || "Unauthorized", options);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message || "Forbidden", options);
    this.name = "ForbiddenError";
  }
}
