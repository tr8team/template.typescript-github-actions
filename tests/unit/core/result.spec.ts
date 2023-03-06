import { chai, should, it, describe, expect } from "vitest";
import { Err, Ok, Res, Result } from "../../../src/lib/core/result.js";
import chaiAsPromised from "chai-as-promised";
// @ts-ignore
import chaiResult from "../../helper.js";

chai.use(chaiAsPromised);
chai.use(chaiResult);

should();


describe("Res", function() {

  describe("async", function() {

    it("should create a result of Ok from an async block", function() {
      const subj = async () => Ok("hello");
      const ex = Ok("hello");
      const act = Res.async(subj);
      return act.should.be.congruent(ex);
    });

    it("should create a result of Err from an async block", function() {
      const subj = async () => Err("hello");
      const ex = Err("hello");
      const act = Res.async(subj);
      return act.should.be.congruent(ex);
    });

  });

  describe("fromAsync", function() {

    it("should convert async results to results Ok Case", async function() {
      const subj = Promise.resolve(Ok<string, { a: string, b: [string, boolean] }>("hello"));
      const act = Ok<string, { a: string, b: [string, boolean] }>("hello");
      const ex = Res.fromAsync(subj);

      return act.should.be.congruent(ex);
    });

    it("should convert async results to result Err Case", async function() {
      const subj = Promise.resolve(Err<string, { a: string, b: [string, boolean] }>({
        a: "hello",
        b: ["what", false]
      }));
      const ex = Err<string, { a: string, b: [string, boolean] }>({
        a: "hello",
        b: ["what", false]
      });
      const act = Res.fromAsync(subj);

      // assert
      return act.should.be.congruent(ex);
    });

  });

  describe("all", function() {

    function R<T>(s: T): Result<T, string> {
      return Ok(s);
    }

    it("should return all the result as a tuple if all results are successful", async function() {
      const subj = [R("a"), R(false), R(["a", "b", "c"]), R({ color: "red", name: "John" }), R(5), R(7)];
      const ex = Ok(["a", false, ["a", "b", "c"], { color: "red", name: "John" }, 5, 7]);

      const act = Res.all(...subj);
      await act.should.be.congruent(ex);
    });

    it("should return all errors if even 1 result is unsuccessful", async function() {
      const s1 = [R("a"), Err("err1"), R(["a", "b", "c"]), R({ color: "red", name: "John" }), R(5), R(7)];
      const e1 = Err(["err1"]);
      const a1 = Res.all(...s1);
      await a1.should.be.congruent(e1);

      const s2 = [R("a"), Err("err1"), R(["a", "b", "c"]), R({
        color: "red",
        name: "John"
      }), Err("err3"), R(7), Err("err2")];
      const e2 = Err(["err1", "err3", "err2"]);
      const a2 = Res.all(...s2);
      await a2.should.be.congruent(e2);
    });

  });
});

describe("Result", function() {

  describe("construction", function() {

    describe("Ok", function() {

      const theory = [
        {
          name: "object",
          subject: {
            a: "hello",
            b: 2,
            c: {
              "__hey": [false, "water"],
              12: {
                whil: new Date(23001)
              }
            }
          },
          expected: {
            a: "hello",
            b: 2,
            c: {
              "__hey": [false, "water"],
              12: {
                whil: new Date(23001)
              }
            }
          }
        },
        {
          name: "string",
          subject: "hello",
          expected: "hello"
        },
        {
          name: "number",
          subject: -72001,
          expected: -72001
        },
        {
          name: "date",
          subject: new Date(2020, 2, 1),
          expected: new Date(2020, 2, 1)
        }
      ];
      theory.forEach(({ name, subject, expected }) => {
        it(`should return Result<${name}> with Ok type`, async function() {
          const result = Ok(subject);
          await result.should.be.okOf(expected);
        });
      });
    });

    describe("Err", function() {
      const theory = [
        {
          name: "object",
          subject: {
            a: "hello",
            b: 2,
            c: {
              "__hey": [false, "water"],
              12: {
                whil: new Date(23001)
              }
            }
          },
          expected: {
            a: "hello",
            b: 2,
            c: {
              "__hey": [false, "water"],
              12: {
                whil: new Date(23001)
              }
            }
          }
        },
        {
          name: "string",
          subject: "hello",
          expected: "hello"
        },
        {
          name: "number",
          subject: -72001,
          expected: -72001
        },
        {
          name: "date",
          subject: new Date(2020, 2, 1),
          expected: new Date(2020, 2, 1)
        }
      ];
      theory.forEach(({ name, subject, expected }) => {
        it(`should return Result<?, ${name}> with Err type`, async function() {
          const result = Err(subject);
          await result.should.errOf(expected);
        });
      });
    });

  });

  describe("isOk", function() {
    it("should return true if the Result is Ok", async function() {
      const result = Ok<number, Error>(5);
      const act = await result.isOk();
      act.should.be.true;
    });
    it("should return false if the Result is Err", async function() {
      const result = Err<number, number>(5);
      const act = await result.isOk();
      act.should.be.false;
    });
  });

  describe("isErr", function() {
    it("should return true if the Result is Err", async function() {
      const result = Err<number, number>(5);
      const act = await result.isErr();
      act.should.be.true;
    });
    it("should return false if the Result is Ok", async function() {
      const result = Ok<number, number>(5);
      const act = await result.isErr();
      act.should.be.false;
    });
  });

  describe("map", function() {
    it("should apply the mapper function to the Ok value", async function() {
      const result = Ok<number, Error>(5);
      const mapped = result.map(val => val * 2);
      return mapped.should.be.okOf(10);
    });
    it("should return the same Err value and ignore mapper function", async function() {
      const result = Err<number, string>("error");
      const mapped = result.map(val => val * 2);
      await mapped.should.be.errOf("error");
    });
    it("should apply the async mapper function to the Ok value", async function() {
      const result = Ok(5);
      const mapped = result.map(val => Promise.resolve(val * 2));
      return mapped.should.be.okOf(10);
    });
    it("should return the same Err value and ignore mapper function", async function() {
      const result = Err<number, string>("this the error");
      const mapped = result.map(val => Promise.resolve(val * 2));
      return mapped.should.be.errOf("this the error");

    });
  });

  describe("mapErr", function() {
    it("should apply the error mapper function to the Err value", function() {
      const result = Err<number, string>("error");
      const mapped = result.mapErr(val => val + " occurred");
      return mapped.should.be.errOf("error occurred");
    });
    it("should return the same Ok value and ignore the error mapper value", function() {
      const result = Ok<number, string>(5);
      const mapped = result.mapErr(val => val + " occurred");
      return mapped.should.be.okOf(5);
    });
    it("should apply the async error mapper function to the Err value", function() {
      const result = Err<number, string>("error");
      const mapped = result.mapErr(val => Promise.resolve(val + " occurred"));
      return mapped.should.be.errOf("error occurred");
    });
    it("should return the same Ok value and ignore the async error mapper value", function() {
      const result = Ok<number, string>(5);
      const mapped = result.mapErr(val => Promise.resolve(val + " occurred"));
      return mapped.should.be.okOf(5);
    });
  });

  describe("andThen", function() {
    it("should apply the function to the Ok value and return the new Result", function() {
      const result = Ok<number, string>(5);
      const andThen = result.andThen(val => Ok(val * 2));
      return andThen.should.be.okOf(10);
    });
    it("should return the same Err value and ignore the function", async function() {
      const result = Err<number, string>("error");
      const andThen = result.andThen(val => Ok(val * 2));
      return andThen.should.be.errOf("error");
    });
    it("should apply the async function to the Ok value and return the new Result", async function() {
      const result = Ok<number, string>(5);
      const andThen = result.andThen<number>(val => Promise.resolve(Ok(val * 2)));
      return andThen.should.be.okOf(10);
    });
    it("should return the same Err value and ignore the async function", async function() {
      const result = Err<number, string>("error");
      const andThen = result.andThen<number>(val => Promise.resolve(Ok(val * 2)));
      return andThen.should.be.errOf("error");
    });

    it("should apply the function to the Ok value and return the new Error", function() {
      const result = Ok<number, string>(5);
      const andThen = result.andThen(val => Err(`out: ${val}`));
      return andThen.should.be.errOf("out: 5");
    });
    it("should return the same Err value and ignore the err function", async function() {
      const result = Err<number, string>("error");
      const andThen = result.andThen(val => Err(`out: ${val}`));
      return andThen.should.be.errOf("error");
    });
    it("should apply the async function to the Ok value and return the new Error", async function() {
      const result = Ok<number, string>(5);
      const andThen = result.andThen<number>(val => Promise.resolve(Err(`out: ${val}`)));
      return andThen.should.be.errOf("out: 5");
    });
    it("should return the same Err value and ignore the async err function", async function() {
      const result = Err<number, string>("error");
      const andThen = result.andThen<number>(val => Promise.resolve(Err(`out: ${val}`)));
      return andThen.should.be.errOf("error");
    });

  });

  describe("match", function() {
    it("should call the ok function if the Result is Ok", async function() {
      const result = Ok(5);
      const matched = await result.match({
        ok: val => `${val * 2}`,
        err: val => val + " occurred"
      });
      matched.should.deep.equal("10");
    });
    it("should call the err function if the Result is Err", async function() {
      const result = Err<number, string>("error");
      const matched = await result.match({
        ok: val => `${val * 2}`,
        err: val => val + " occurred"
      });
      matched.should.equal("error occurred");
    });
    it("should call the async ok function if the Result is Ok", async function() {
      const result = Ok(5);
      const matched = await result.match({
        ok: val => Promise.resolve(`${val * 2}`),
        err: val => Promise.resolve(val + " occurred")
      });
      matched.should.equal("10");
    });
    it("should call the async err function if the Result is Err", async function() {
      const result = Err<number, string>("error");
      const matched = await result.match({
        ok: val => Promise.resolve(`${val * 2}`),
        err: val => Promise.resolve(val + " occurred")
      });
      matched.should.equal("error occurred");
    });
    it("should call the ok function if the Result is Ok and ignore the async err function", async function() {
      const result = Ok(5);
      const matched = await result.match({
        ok: val => `${val * 2}`,
        err: val => Promise.resolve(val + " occurred")
      });
      matched.should.equal("10");
    });
    it("should call the err function if the Result is Err and ignore the async ok function", async function() {
      const result = Err<number, string>("error") as Result<number, string>;
      const matched = await result.match({
        ok: val => Promise.resolve(`${val * 2}`),
        err: val => val + " occurred"
      });
      matched.should.equal("error occurred");
    });
    it("should call the ok async function if the Result is Ok and ignore the err function", async function() {
      const result = Ok(5);
      const matched = await result.match({
        ok: val => Promise.resolve(`${val * 2}`),
        err: val => val + " occurred"
      });
      matched.should.equal("10");
    });
    it("should call the err async function if the Result is Err and ignore the ok function", async function() {
      const result = Err<number, string>("error") as Result<number, string>;
      const matched = await result.match({
        ok: val => `${val * 2}`,
        err: val => Promise.resolve(val + " occurred")
      });
      matched.should.equal("error occurred");
    });
  });

  describe("unwrapOr", function() {
    it("should unwrap the Ok value", async function() {
      const result = Ok(5);
      const unwrapped = await result.unwrapOr(0);
      unwrapped.should.equal(5);
    });
    it("should return the default value for Err value", async function() {
      const result = Err<number, string>("error");
      const unwrapped = await result.unwrapOr(0);
      unwrapped.should.equal(0);
    });
    it("should call the provided function for Err value", async function() {
      const result = Err<number, string>("error");
      const unwrapped = await result.unwrapOr(err => err.length);
      unwrapped.should.equal(5);
    });
    it("should return the default value as a promise for Err value", async function() {
      const result = Err<number, string>("error");
      const unwrapped = await result.unwrapOr(Promise.resolve(0));
      unwrapped.should.equal(0);
    });
  });

  describe("unwrap", function() {

    const okTheory = [
      {
        name: "object",
        subject: Ok({
          a: "hello",
          b: 2,
          c: {
            "__hey": [false, "water"],
            12: {
              whil: new Date(23001)
            }
          }
        }),
        expected: {
          a: "hello",
          b: 2,
          c: {
            "__hey": [false, "water"],
            12: {
              whil: new Date(23001)
            }
          }
        }
      },
      {
        name: "string",
        subject: Ok("hello"),
        expected: "hello"
      },
      {
        name: "number",
        subject: Ok(-72001),
        expected: -72001
      },
      {
        name: "date",
        subject: Ok(new Date(2020, 2, 1)),
        expected: new Date(2020, 2, 1)
      }
    ];
    okTheory.forEach(({ name, subject, expected }) => {
      it(`should unwrap the inner value if the value is Ok. Case: ${name}`, async function() {
        const act = await subject.unwrap();
        act.should.deep.equal(expected);
      });
    });

    const errTheory = [
      {
        name: "object",
        subject: Err({
          a: "hello",
          b: 2,
          c: {
            "__hey": [false, "water"],
            12: {
              whil: new Date(23001)
            }
          }
        }),
        expected: "Failed to unwrap"
      },
      {
        name: "string",
        subject: Err("hello"),
        expected: "Failed to unwrap"
      },
      {
        name: "number",
        subject: Err(-72001),
        expected: "Failed to unwrap"
      },
      {
        name: "date",
        subject: Err(new Date(2020, 2, 1)),
        expected: "Failed to unwrap"
      }
    ];
    errTheory.forEach(({ name, subject, expected }) => {
      it(`should should throw an Error if and Error is wrapped. Case: ${name}`, async function() {
        return expect(subject.unwrap()).to.be.rejectedWith(expected);
      });
    });
  });

  describe("unwrapErr", function() {

    const okTheory = [
      {
        name: "object",
        subject: Err({
          a: "hello",
          b: 2,
          c: {
            "__hey": [false, "water"],
            12: {
              whil: new Date(23001)
            }
          }
        }),
        expected: {
          a: "hello",
          b: 2,
          c: {
            "__hey": [false, "water"],
            12: {
              whil: new Date(23001)
            }
          }
        }
      },
      {
        name: "string",
        subject: Err("hello"),
        expected: "hello"
      },
      {
        name: "number",
        subject: Err(-72001),
        expected: -72001
      },
      {
        name: "date",
        subject: Err(new Date(2020, 2, 1)),
        expected: new Date(2020, 2, 1)
      }
    ];
    okTheory.forEach(({ name, subject, expected }) => {
      it(`should unwrap the inner value if the value is Err. Case: ${name}`, async function() {
        const act = await subject.unwrapErr();
        act.should.deep.equal(expected);
      });
    });

    const errTheory = [
      {
        name: "object",
        subject: Ok({
          a: "hello",
          b: 2,
          c: {
            "__hey": [false, "water"],
            12: {
              whil: new Date(23001)
            }
          }
        }),
        expected: "Failed to unwrap"
      },
      {
        name: "string",
        subject: Ok("hello"),
        expected: "Failed to unwrap"
      },
      {
        name: "number",
        subject: Ok(-72001),
        expected: "Failed to unwrap"
      },
      {
        name: "date",
        subject: Ok(new Date(2020, 2, 1)),
        expected: "Failed to unwrap"
      }
    ];
    errTheory.forEach(({ name, subject, expected }) => {
      it(`should should throw an Error if Ok is wrapped. Case: ${name}`, async function() {
        return expect(subject.unwrapErr()).to.be.rejectedWith(expected);
      });
    });
  });

  describe("native", function() {

    const okTheory = [
      {
        name: "object",
        subject: Ok({
          a: "hello",
          b: 2,
          c: {
            "__hey": [false, "water"],
            12: {
              whil: new Date(23001)
            }
          }
        }),
        expected: {
          a: "hello",
          b: 2,
          c: {
            "__hey": [false, "water"],
            12: {
              whil: new Date(23001)
            }
          }
        }
      },
      {
        name: "string",
        subject: Ok("hello"),
        expected: "hello"
      },
      {
        name: "number",
        subject: Ok(-72001),
        expected: -72001
      },
      {
        name: "date",
        subject: Ok(new Date(2020, 2, 1)),
        expected: new Date(2020, 2, 1)
      }
    ];
    okTheory.forEach(({ name, subject, expected }) => {
      it(`should return the Ok value if its Ok. Case: ${name}`, async function() {
        const act = await subject.native();
        act.should.deep.equal(expected);
      });
    });

    const errTheory = [
      {
        name: "object",
        subject: Err<number, object>({
          a: "hello",
          b: 2,
          c: {
            "__hey": [false, "water"],
            12: {
              whil: new Date(23001)
            }
          }
        }),
        expected: {
          a: "hello",
          b: 2,
          c: {
            "__hey": [false, "water"],
            12: {
              whil: new Date(23001)
            }
          }
        }
      },
      {
        name: "string",
        subject: Err<number, string>("hello"),
        expected: "hello"
      },
      {
        name: "number",
        subject: Err<number, number>(-72001),
        expected: -72001
      },
      {
        name: "date",
        subject: Err<number, Date>(new Date(2020, 2, 1)),
        expected: new Date(2020, 2, 1)
      }
    ];
    errTheory.forEach(({ name, subject, expected }) => {
      it(`should return the Err value if its Err. Case: ${name}`, async function() {
        const act = await subject.native();
        act.should.deep.equal(expected);
      });
    });
  });

  // describe ok
  describe("ok", function() {
    it("should return Result Some if its was Ok", function() {
      const act = Ok(1).ok();
      act.should.be.someOf(1);
    });
    it("should return Result None if its was Err", function() {
      const act = Err(1).ok();
      act.should.be.none;
    });
  });

  // describe err
  describe("err", function() {
    it("should return Result Some if its was Err", function() {
      const act = Err(1).err();
      act.should.be.someOf(1);
    });
    it("should return Result None if its was Ok", function() {
      const act = Ok(1).err();
      act.should.be.none;
    });
  });

  // describe run
  describe("run", function() {
    it("should run the function as a side effect, but not capture the result, if its a Ok", async function() {
      const subj = Ok(5);
      let external = 6;
      const act = await subj.run((val) => {
        external += val + 1;
        return val + 1;
      });
      const expected = Ok(5);
      await act.should.be.congruent(expected);
      external.should.equal(12);

    });
    it("should run the function as a side effect, but not capture the result, if its a Err", async function() {
      const subj = Err<number, number>(5);
      let external = 6;
      const act = await subj.run((val) => {
        external += val + 1;
        return val + 1;
      });
      const expected = Err(5);
      await act.should.be.congruent(expected);
      external.should.equal(6);
    });

    // async
    it("should run the async function as a side effect, but not capture the result, if its a Ok", async function() {
      const subj = Ok(5);
      let external = 6;
      const act = await subj.run((val) => {
        external += val + 1;
        return Promise.resolve(val + 1);
      });
      const expected = Ok(5);
      await act.should.be.congruent(expected);
      external.should.equal(12);

    });
    it("should run the async function as a side effect, but not capture the result, if its a Err", async function() {
      const subj = Err<number, number>(5);
      let external = 6;
      const act = await subj.run((val) => {
        external += val + 1;
        return Promise.resolve(val + 1);
      });
      const expected = Err(5);
      await act.should.be.congruent(expected);
      external.should.equal(6);
    });
  });

  // describe exec
  describe("exec", function() {

    it("should run the function as a side effect, but not capture the result, if its a Ok", async function() {
      const subj = Ok(5);
      let external = 6;
      const act = await subj.exec((val) => {
        external += val + 1;
        return val + 1;
      });
      const expected = Ok(5);
      await act.should.be.congruent(expected);
      external.should.equal(12);

    });
    it("should run the function as a side effect, but not capture the result, if its a Err, and auto map to Error", async function() {
      const subj = Err<number, number>(5);
      let external = 6;
      const act = await subj.exec((val) => {
        external += val + 1;
        return val + 1;
      });
      const expected = "5";
      await act.should.have.errErrorMessage(expected);
      external.should.equal(6);
    });

    // async
    it("should run the async function as a side effect, but not capture the result, if its a Ok", async function() {
      const subj = Ok(5);
      let external = 6;
      const act = await subj.exec((val) => {
        external += val + 1;
        return Promise.resolve(val + 1);
      });
      const expected = Ok(5);
      await act.should.be.congruent(expected);
      external.should.equal(12);

    });
    it("should run the async function as a side effect, but not capture the result, if its a Err, and auto map to Error", async function() {
      const subj = Err<number, number>(5);
      let external = 6;
      const act = await subj.exec((val) => {
        external += val + 1;
        return Promise.resolve(val + 1);
      });
      const expected = "5";
      await act.should.have.errErrorMessage(expected);
      external.should.equal(6);
    });

    it("should automatically map if Err is of Native Error", async function() {
      const subj = Err<number, Error>(new Error("native error here!"));
      let external = 6;
      const act = await subj.exec((val) => {
        external += val + 1;
        return Promise.resolve(val + 1);
      });
      const expected = "native error here!";
      await act.should.have.errErrorMessage(expected);
      external.should.equal(6);
    });


    // custom error mapper
    it("should run the function as a side effect, but not capture the result, if its a Ok, even with customer error mapper", async function() {
      const subj = Ok<number, number>(5);
      let external = 6;
      const act = await subj.exec((val) => {
        external += val + 1;
        return val + 1;
      }, (err) => new Error(`error: ${err}`));
      const expected = Ok(5);
      await act.should.be.congruent(expected);
      external.should.equal(12);
    });
    it("should run the function as a side effect, but not capture the result, if its a Err, and use customer error mapper", async function() {
      const subj = Err<number, number>(5);
      let external = 6;
      const act = await subj.exec((val) => {
        external += val + 1;
        return val + 1;
      }, (err) => new Error(`error: ${err}`));
      const expected = "error: 5";
      await act.should.have.errErrorMessage(expected);
      external.should.equal(6);
    });

    // async custom error mapper
    it("should run the async function as a side effect, but not capture the result, if its a Ok, even with customer error mapper", async function() {
      const subj = Ok<number, number>(5);
      let external = 6;
      const act = await subj.exec((val) => {
        external += val + 1;
        return Promise.resolve(val + 1);
      }, (err) => new Error(`error: ${err}`));
      const expected = Ok(5);
      await act.should.be.congruent(expected);
      external.should.equal(12);
    });

    it("should run the async function as a side effect, but not capture the result, if its a Err, and use customer error mapper", async function() {
      const subj = Err<number, number>(5);
      let external = 6;
      const act = await subj.exec((val) => {
        external += val + 1;
        return Promise.resolve(val + 1);
      }, (err) => new Error(`error: ${err}`));
      const expected = "error: 5";
      await act.should.have.errErrorMessage(expected);
      external.should.equal(6);
    });

    // catch error automatically without custom error mapper
    it("should run the function as a side effect if its Result Ok, and capture Errors that are thrown, with custom error mapper", async function() {
      const subj = Err<number, number>(5);
      let external = 6;
      const act = await subj.exec((val) => {
        throw new Error("hello: " + val);
      });
      const expected = "5";
      await act.should.have.errErrorMessage(expected);
      external.should.equal(6);
    });

    // catch error automatically without custom error mapper
    it("should run the async function as a side effect if its Result Ok, and capture Errors that are thrown, without custom error mapper", async function() {
      const subj = Ok<number, number>(5);
      let external = 6;
      const act = await subj.exec((val) => {
        throw new Error("hello: " + val);
      });
      const expected = "hello: 5";
      await act.should.have.errErrorMessage(expected);
      external.should.equal(6);
    });

    // catch string thrown
    it("should run the function as a side effect if its Result Ok, and capture strings that are thrown, with custom error mapper", async function() {
      const subj = Ok<number, number>(5);
      let external = 6;
      const act = await subj.exec((val) => {
        throw "hello: " + val;
      });
      const expected = "hello: 5";
      await act.should.have.errErrorMessage(expected);
      external.should.equal(6);
    });

    // catch object thrown
    it("should run the function as a side effect if its Result Ok, and capture objects that are thrown, with custom error mapper", async function() {
      const subj = Ok<number, number>(5);
      let external = 6;
      const act = await subj.exec((val) => {
        throw { message: "hello: " + val };
      });
      const expected = "{\"message\":\"hello: 5\"}";
      await act.should.have.errErrorMessage(expected);
      external.should.equal(6);
    });


  });

});
