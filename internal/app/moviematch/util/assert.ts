export class MovieMatchError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class MovieMatchUnknownError extends Error {
  name = "MovieMatchUnknownError";
}

export function assert(
  expr: unknown,
  msg = "",
  ErrorType = MovieMatchUnknownError,
): asserts expr {
  if (!expr) {
    throw new ErrorType(msg);
  }
}

export function isRecord(
  value: unknown,
  name = "value",
  ErrorType = MovieMatchError,
): asserts value is Record<string, unknown> {
  assert(
    typeof value === "object" && value !== null,
    `${name} must be an object`,
    ErrorType,
  );
}
