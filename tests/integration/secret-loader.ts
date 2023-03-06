import * as fs from "fs";
import { object, string, z } from "zod";
import { parseJSON } from "../../src/lib/util.js";
import { ZodValidatorAdapter } from "../../src/lib/adapters/zod-validator-adapter.js";
import * as path from "path";
import { Err, Result } from "../../src/lib/core/result.js";

// Secret Schema here
const secret = object({
  gistKeyValue: object({
    gistId: string(),
    token: string()
  })
});

type Secret = z.infer<typeof secret>
const v = new ZodValidatorAdapter(secret);

function loadSecret(): Result<Secret, Error> {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "./secrets.json"), "utf8");
    return parseJSON(raw)
      .andThen(x => v.parse(x));
  } catch (e) {
    if (e instanceof Error) {
      return Err(e);
    } else {
      return Err(new Error(JSON.stringify(e)));
    }
  }
}

export { loadSecret };
