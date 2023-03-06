import { chai, describe, it, should } from "vitest";

import { ZodValidatorAdapter } from "../../../src/lib/adapters/zod-validator-adapter.js";
import { number, object, string } from "zod";
// @ts-ignore
import helper from "../../helper.js";

should();
chai.use(helper);

describe("Zod Validator Adapter", function() {
  describe("Validator", function() {
    const person = object({
      name: string().min(0),
      age: number(),
      address: object({
        blk: number(),
        street: string()
      })
    });
    const v = new ZodValidatorAdapter(person);

    describe("parse", function() {
      it("should return Ok result if the validator succeed", function() {
        // arrange
        const subj = {
          name: "ernest",
          age: 17,
          address: {
            blk: 214,
            street: "jane"
          }
        };
        const expected = {
          name: "ernest",
          age: 17,
          address: {
            blk: 214,
            street: "jane"
          }
        };
        // act
        const act = v.parse(subj);
        // assert
        return act.should.be.okOf(expected);
      });
      it("should return Error result if the validator fails", function() {
        // arrange
        const subj = {
          name: "ernest",
          age: 17,
          address: {
            blk: 214
          }
        };
        // act
        const act = v.parse(subj);
        // assert
        act.should.be.err;

      });
    });
  });
});
