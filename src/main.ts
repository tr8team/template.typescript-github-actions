import { setFailed } from "@actions/core";
import { wait } from "./lib/wait";
import { GithubActionIO } from "./external/github-action-i-o";
import { GithubActionLogger } from "./external/github-action-logger";

const io = new GithubActionIO();
const log = new GithubActionLogger();
try {
  const ms: string = io.get("milliseconds");
  log.debug(`Waiting ${ms} milliseconds ...`); // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

  log.debug(new Date().toTimeString());
  await wait(parseInt(ms, 10));
  log.debug(new Date().toTimeString());

  log.debug(`Done!`);
  io.set("time: ", new Date().toTimeString());
} catch (error) {
  if (error instanceof Error) setFailed(error.message);
}
