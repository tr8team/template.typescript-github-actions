import { GithubActionIO } from "../../../../src/external/github-action-i-o.js";
import { debug, setFailed } from "@actions/core";
import { None } from "../../../../src/lib/core/option.js";

const action = new GithubActionIO();

const p = action.getObject<object>("person", None());
await p.match({
  err: (error)=> {
    setFailed(error.message);
  },
  ok: (person)=> {
    debug(JSON.stringify(person));
  },
});
