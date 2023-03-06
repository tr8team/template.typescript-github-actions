interface ILogger {
  debug(message: string): void;

  notice(message: string): void;

  info(message: string): void;

  warning(message: string | Error): void;

  error(message: string | Error): void;
}

export type { ILogger };
