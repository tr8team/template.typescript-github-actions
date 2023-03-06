import * as core from "@actions/core";
import { ILogger } from "../lib/interface/logger.js";

class GithubActionLogger implements ILogger {
  debug(message: string): void {
    core.debug(message);
  }

  error(message: string): void {
    core.error(message);
  }

  info(message: string): void {
    core.info(message);
  }

  notice(message: string | Error): void {
    core.notice(message);
  }

  warning(message: string | Error): void {
    core.warning(message);
  }
}

export { GithubActionLogger };
