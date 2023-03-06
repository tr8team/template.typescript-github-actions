import { Result } from "../core/result.js";

interface Validator<T> {
  parse(input: unknown): Result<T, Error>;
}

export type { Validator };
