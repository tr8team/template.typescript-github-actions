import { GithubActionIO } from "../../../../src/external/github-action-i-o.js";
import { debug, setFailed } from "@actions/core";
import { boolean, z, number, object, string } from "zod";
import { ZodValidatorAdapter } from "../../../../src/lib/adapters/zod-validator-adapter.js";
import { Validator } from "../../../../src/lib/interface/validator.js";
import { Some } from "../../../../src/lib/core/option.js";


const action = new GithubActionIO();

const person = object({
  name: string(),
  age: number(),
  phone: string(),
  vaccinated: boolean(),
  address: object({
    block: number(),
    door: string(),
    street: string()
  })
});

type Person = z.infer<typeof person>;

const v: Validator<Person> = new ZodValidatorAdapter(person);


const p = action.getObject("person", Some(v));
await p.match({
  err: async (err) => {
    setFailed(err.message);
  },
  ok: async (per) => {
    debug(`Hello ${per.name}!`);
    debug(`You are ${per.age} years old!`);
    debug(`You ${per.vaccinated ? "have" : "have not"} taken the vaccine!`);
    debug(`Your phone number is ${per.phone}!`);
    debug(`Your address is ${JSON.stringify(per.address)}!`);
  }
});
