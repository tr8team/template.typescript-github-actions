import { GithubActionIO } from "../../../../src/external/github-action-i-o.js";
import { debug } from "@actions/core";

const action = new GithubActionIO();

const name = action.get("name");
const age = action.get("age");

debug(`Hello ${name}!`);
debug(`You are ${age} years old!`);
