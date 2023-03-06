import { chai, should, it, describe, expect } from "vitest";
import { None, Opt, Option, Some } from "../../../src/lib/core/option.js";
// @ts-ignore
import helper from "../../helper.js";
import { Err, Ok } from "../../../src/lib/core/result.js";
import chaiAsPromised from "chai-as-promised";

should();
chai.use(chaiAsPromised);
chai.use(helper);

describe("Opt", function() {

  describe("fromAsync", function() {

    it("should resolve a promise of an option to an option for Some", async function() {
      const subj = Promise.resolve(Some(72));
      const act = Opt.fromAsync(subj);
      const ex = Some(72);
      await act.should.be.congruent(ex);

      it("should resolve a promise of an option to an option for None", async function() {
        const subj = Promise.resolve(None());
        const act = Opt.fromAsync(subj);
        const ex = None();
        await act.should.be.congruent(ex);
      });
    });
  });

  describe("async", function() {

    it("should create an option of Some from an async block", function() {
      const subj = async () => Some(72);
      const act = Opt.async(subj);
      const ex = Some(72);
      return act.should.be.congruent(ex);

    });

    it("should create an option of None from an async block", function() {
      const subj = async () => None();
      const act = Opt.async(subj);
      const ex = None();
      return act.should.be.congruent(ex);
    });

  });


  describe("all", function() {


    it("should return Some of all the values if all are Some", async function() {
      const subj = [Some<number>(1), Some<string>("string"), Some<Date>(new Date(1, 2, 3))];
      const act = Opt.all(...subj);
      const ex = Some([1, "string", new Date(1, 2, 3)]);
      await act.should.be.congruent(ex);
    });

    it("should return None if any of the values are None", async function() {
      const subj = [Some(1), None(), Some(false), Some(null)];
      const act = Opt.all(...subj);
      const ex = None();
      await act.should.be.congruent(ex);
    });

  });

});


describe("Option", function() {


  describe("construction", function() {
    describe("None", function() {
      it("should not equate to anything else", async function() {
        await None().should.not.be.congruent({});
      });

      it("should equate to another copy of itself", async function() {
        await None().should.be.congruent(None());
      });
    });
    describe("Some", function() {
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
        it(`should return Some<${name}> with Some type`, async function() {
          const option = Some(subject);
          await option.should.be.someOf(expected);
        });
      });

    });
  });


  describe("isSome", function() {
    it("should return true if the Option is Some", async function() {
      const result: Option<number> = Some(5);
      const act = await result.isSome();
      act.should.be.true;
    });
    it("should return false if the Option is None", async function() {
      const result: Option<number> = None();
      const act = await result.isSome();
      act.should.be.false;
    });
  });

  // describe isNone
  describe("isNone", function() {
    it("should return true if the Option is None", async function() {
      const result: Option<number> = None();
      const act = await result.isNone();
      act.should.be.true;
    });
    it("should return false if the Option is Some", async function() {
      const result: Option<number> = Some(5);
      const act = await result.isNone();
      act.should.be.false;
    });
  });

  // describe match
  describe("match", function() {
    it("should return the value of Some", async function() {
      const result: Option<number> = Some(5);
      const act = await result.match({
        some: (x) => x,
        none: () => 0
      });
      act.should.be.equal(5);
    });
    it("should return the value of None", async function() {
      const result: Option<number> = None();
      const act = await result.match({
        some: (x) => x,
        none: () => 0
      });
      act.should.be.equal(0);
    });

    it("should return the value of Some with async matchers", async function() {
      const result: Option<number> = Some(5);
      const act = await result.match({
        some: (x) => Promise.resolve(x),
        none: () => Promise.resolve(0)
      });
      act.should.be.equal(5);
    });

    it("should return the value of None with async matchers", async function() {
      const result: Option<number> = None();
      const act = await result.match({
        some: (x) => Promise.resolve(x),
        none: () => Promise.resolve(0)
      });
      act.should.be.equal(0);
    });

    it("should return the value of some with non function none", async function() {
      const result: Option<number> = Some(5);
      const act = await result.match({
        some: (x) => x,
        none: 0
      });
      act.should.be.equal(5);
    });

    it("should return the value of none with non function none", async function() {
      const result: Option<number> = None();
      const act = await result.match({
        some: (x) => x,
        none: 0
      });
      act.should.be.equal(0);
    });

  });

  // describe map
  describe("map", function() {
    it("should return the value of Some", async function() {
      const result: Option<number> = Some(5);
      const act = await result.map(x => x + 1);
      await act.should.be.someOf(6);
    });
    it("should return None", async function() {
      const result: Option<number> = None();
      const act = await result.map(x => x + 1);
      await act.should.be.none;
    });
    // async maps
    it("should return the value of Some with async mappers", async function() {
      const result: Option<number> = Some(5);
      const act = await result.map(x => Promise.resolve(x + 1));
      await act.should.be.someOf(6);
    });
    it("should return None async mappers", async function() {
      const result: Option<number> = None();
      const act = await result.map(x => Promise.resolve(x + 1));
      await act.should.be.none;
    });
  });

  // describe andThen
  describe("andThen", function() {
    it("should return the value of Some", async function() {
      const result: Option<number> = Some(5);
      const act = await result.andThen(x => Some(x + 1));
      await act.should.be.someOf(6);
    });
    it("should return None", async function() {
      const result: Option<number> = None();
      const act = await result.andThen(x => Some(x + 1));
      await act.should.be.none;
    });
    // async andThen
    it("should return the value of Some with async andThens", async function() {
      const result: Option<number> = Some(5);
      const act = await result.andThen(x => Promise.resolve(Some(x + 1)));
      await act.should.be.someOf(6);
    });
    it("should return None with async andThens", async function() {
      const result: Option<number> = None();
      const act = await result.andThen(x => Promise.resolve(Some(x + 1)));
      await act.should.be.none;
    });

    // andThen returns None
    it("should return None if the andThen returns None original is Some", async function() {
      const result: Option<number> = Some(5);
      const act = await result.andThen(_ => None());
      await act.should.be.none;
    });
    it("should return None if the andThen returns None original is None", async function() {
      const result: Option<number> = None();
      const act = await result.andThen(_ => None());
      await act.should.be.none;
    });
    // async andThen returns None
    it("should return None if the async andThen returns None original is Some", async function() {
      const result: Option<number> = Some(5);
      const act = await result.andThen(_ => Promise.resolve(None()));
      await act.should.be.none;
    });
    it("should return None if the async andThen returns None original is None", async function() {
      const result: Option<number> = None();
      const act = await result.andThen(_ => Promise.resolve(None()));
      await act.should.be.none;
    });
  });

  // describe unwrap
  describe("unwrap", function() {
    const someTheory = [
      {
        name: "object",
        subject: Some({ a: 1, b: 2, c: 3 }),
        expected: { a: 1, b: 2, c: 3 }
      },
      {
        name: "string",
        subject: Some("hello"),
        expected: "hello"
      },
      {
        name: "number",
        subject: Some(-72001),
        expected: -72001
      },
      {
        name: "date",
        subject: Some(new Date(2020, 2, 1)),
        expected: new Date(2020, 2, 1)
      }
    ];
    someTheory.forEach(({ name, subject, expected }) => {
      it(`should return the value of Some<${name}>`, async function() {
        const act = await subject.unwrap();
        act.should.be.deep.equal(expected);
      });
    });

    it("should throw an error if the Option is None", async function() {
      const result: Option<number> = None();

      await expect(result.unwrap()).to.be.rejectedWith("Failed to unwrap");
    });
  });

  // describe unwrapOr
  describe("unwrapOr", function() {
    type Theory<T> = {
      name: string,
      subject: Option<T>,
      def: T,
      expected: T
    }
    // generate some theory, test cases of some wrapped in values
    const someTheory: Theory<any>[] = [
      {
        name: "object",
        subject: Some({ a: 1, b: 2, c: 3 }),
        def: {},
        expected: { a: 1, b: 2, c: 3 }
      },
      {
        name: "string",
        subject: Some("hello"),
        def: "default",
        expected: "hello"
      },
      {
        name: "number",
        subject: Some(-72001),
        def: 0,
        expected: -72001
      },
      {
        name: "date",
        subject: Some(new Date(2020, 2, 1)),
        def: new Date(1970, 1, 1),
        expected: new Date(2020, 2, 1)
      }
    ];
    someTheory.forEach(({ name, subject, def, expected }) => {
      it(`should return the value of Some<${name}>`, async function() {
        const act = await subject.unwrapOr(def);
        act.should.be.deep.equal(expected);
      });
    });

    // generate none theory, test cases of none wrapped in values
    const noneTheory: Theory<any>[] = [
      {
        name: "object",
        subject: None(),
        def: {},
        expected: {}
      },
      {
        name: "string",
        subject: None(),
        def: "default",
        expected: "default"
      },
      {
        name: "number",
        subject: None(),
        def: 0,
        expected: 0
      },
      {
        name: "date",
        subject: None(),
        def: new Date(1970, 1, 1),
        expected: new Date(1970, 1, 1)
      }
    ];
    noneTheory.forEach(({ name, subject, def, expected }) => {
      it(`should return the value of Some<${name}>`, async function() {
        const act = await subject.unwrapOr(def);
        act.should.be.deep.equal(expected);
      });
    });

    // generate some theory, test cases of some wrapped in promises
    const somePromiseTheory: Theory<any>[] = [
      {
        name: "object",
        subject: Some({ a: 1, b: 2, c: 3 }),
        def: Promise.resolve({}),
        expected: { a: 1, b: 2, c: 3 }
      },
      {
        name: "string",
        subject: Some("hello"),
        def: Promise.resolve("default"),
        expected: "hello"
      },
      {
        name: "number",
        subject: Some(-72001),
        def: Promise.resolve(0),
        expected: -72001
      },
      {
        name: "date",
        subject: Some(new Date(2020, 2, 1)),
        def: Promise.resolve(new Date(1970, 1, 1)),
        expected: new Date(2020, 2, 1)
      }
    ];
    somePromiseTheory.forEach(({ name, subject, def, expected }) => {
      it(`should return the value of Some<${name}>`, async function() {
        const act = await subject.unwrapOr(def);
        act.should.be.deep.equal(expected);
      });
    });

    // generate none theory, test cases of none wrapped in promises
    const nonePromiseTheory: Theory<any>[] = [
      {
        name: "object",
        subject: None(),
        def: Promise.resolve({}),
        expected: {}
      },
      {
        name: "string",
        subject: None(),
        def: Promise.resolve("default"),
        expected: "default"
      },
      {
        name: "number",
        subject: None(),
        def: Promise.resolve(0),
        expected: 0
      },
      {
        name: "date",
        subject: None(),
        def: Promise.resolve(new Date(1970, 1, 1)),
        expected: new Date(1970, 1, 1)
      }
    ];
    nonePromiseTheory.forEach(({ name, subject, def, expected }) => {
      it(`should return the value of Some<${name}>`, async function() {
        const act = await subject.unwrapOr(def);
        act.should.be.deep.equal(expected);
      });
    });

    // generate some theory, test cases of none wrapped in functions
    const noneFunctionTheory: Theory<any>[] = [
      {
        name: "object",
        subject: None(),
        def: () => ({}),
        expected: {}
      },
      {
        name: "string",
        subject: None(),
        def: () => ("default"),
        expected: "default"
      },
      {
        name: "number",
        subject: None(),
        def: () => (0),
        expected: 0
      },
      {
        name: "date",
        subject: None(),
        def: () => (new Date(1970, 1, 1)),
        expected: new Date(1970, 1, 1)
      }
    ];
    noneFunctionTheory.forEach(({ name, subject, def, expected }) => {
      it(`should return the value of Some<${name}>`, async function() {
        const act = await subject.unwrapOr(def);
        act.should.be.deep.equal(expected);
      });
    });

    // generate some theory, test cases of none wrapped in async functions
    const noneAsyncFunctionTheory: Theory<any>[] = [
      {
        name: "object",
        subject: None(),
        def: () => Promise.resolve({}),
        expected: {}
      },
      {
        name: "string",
        subject: None(),
        def: () => Promise.resolve("default"),
        expected: "default"
      },
      {
        name: "number",
        subject: None(),
        def: () => Promise.resolve(0),
        expected: 0
      },
      {
        name: "date",
        subject: None(),
        def: () => Promise.resolve(new Date(1970, 1, 1)),
        expected: new Date(1970, 1, 1)
      }
    ];
    noneAsyncFunctionTheory.forEach(({ name, subject, def, expected }) => {
      it(`should return the value of Some<${name}>`, async function() {
        const act = await subject.unwrapOr(def);
        act.should.be.deep.equal(expected);
      });
    });

  });

  // describe asErr
  describe("asErr", function() {

    it("should return the value of Some as Result Type Error", async function() {
      const result: Option<number> = Some(5);
      const act = await result.asErr("default");
      const expected = Err(5);
      act.should.be.congruent(expected);
    });

    it("should return None", async function() {
      const result: Option<number> = None();
      const act = await result.asErr("default");
      const expected = Ok("default");
      await act.should.be.congruent(expected);
    });

    // async inputs
    it("should return the value of Some as Result Type Error with async inputs", async function() {
      const result: Option<number> = Some(5);
      const act = await result.asErr(Promise.resolve("default"));
      const expected = Err(5);
      await act.should.be.congruent(expected);
    });

    it("should return None with async inputs", async function() {
      const result: Option<number> = None();
      const act = await result.asErr(Promise.resolve("default"));
      const expected = Ok("default");
      await act.should.be.congruent(expected);
    });

  });

  // describe asOk
  describe("asOk", function() {

    it("should return the value of Some as Result Type Ok", async function() {
      const result: Option<number> = Some(5);
      const act = await result.asOk("default");
      const expected = Ok(5);
      await act.should.be.congruent(expected);
    });

    it("should return None", async function() {
      const result: Option<number> = None();
      const act = await result.asOk("default");
      const expected = Err("default");
      await act.should.be.congruent(expected);
    });

    // async inputs
    it("should return the value of Some as Result Type Ok with async inputs", async function() {
      const result: Option<number> = Some(5);
      const act = await result.asOk(Promise.resolve("default"));
      const expected = Ok(5);
      await act.should.be.congruent(expected);
    });

    it("should return None with async inputs", async function() {
      const result: Option<number> = None();
      const act = await result.asOk(Promise.resolve("default"));
      const expected = Err("default");
      await act.should.be.congruent(expected);
    });
  });

  // describe asResult
  describe("asResult", function() {

    it("should evaluate the some case to obtain a result if Option is Some", async function() {
      const subj = Some(5);
      const act = await subj.asResult({
        some: (val) => Ok(val + 1),
        none: () => Err("default")
      });
      const expected = Ok(6);
      await act.should.be.congruent(expected);
    });

    it("should evaluate the none case to obtain a result if Option is None", async function() {
      const subj: Option<number> = None();
      const act = await subj.asResult({
        some: (val) => Ok(val + 1),
        none: () => Err("default")
      });
      const expected = Err("default");
      await act.should.be.congruent(expected);
    });

    // async some
    it("should evaluate the some case to obtain a result if Option is Some with async some", async function() {
      const subj = Some(5);
      const act = await subj.asResult({
        some: (val) => Promise.resolve(Ok(val + 1)),
        none: () => Err("default")
      });
      const expected = Ok(6);
      await act.should.be.congruent(expected);
    });

    it("should evaluate the none case to obtain a result if Option is None with async some", async function() {
      const subj: Option<number> = None();
      const act = await subj.asResult({
        some: (val) => Promise.resolve(Ok(val + 1)),
        none: () => Err("default")
      });
      const expected = Err("default");
      await act.should.be.congruent(expected);
    });

    // async none
    it("should evaluate the some case to obtain a result if Option is Some with async none", async function() {
      const subj = Some(5);
      const act = await subj.asResult({
        some: (val) => Ok(val + 1),
        none: () => Promise.resolve(Err("default"))
      });
      const expected = Ok(6);
      await act.should.be.congruent(expected);
    });

    it("should evaluate the none case to obtain a result if Option is None with async none", async function() {
      const subj: Option<string> = None();
      const act = await subj.asResult({
        some: (val) => Ok(val + 1),
        none: () => Promise.resolve(Err("default"))
      });
      const expected = Err("default");
      await act.should.be.congruent(expected);
    });

    // async none non function
    it("should evaluate the some case to obtain a result if Option is Some with async none non function", async function() {
      const subj = Some(5);
      const act = await subj.asResult({
        some: (val) => Ok(val + 1),
        none: Promise.resolve(Err("default"))
      });
      const expected = Ok(6);
      await act.should.be.congruent(expected);
    });

    it("should evaluate the none case to obtain a result if Option is None with async none non function", async function() {
      const subj: Option<string> = None();
      const act = await subj.asResult({
        some: (val) => Ok(val + 1),
        none: Promise.resolve(Err("default"))
      });
      const expected = Err("default");
      await act.should.be.congruent(expected);
    });

    // none non function
    it("should evaluate the some case to obtain a result if Option is Some with none non function", async function() {
      const subj = Some(5);
      const act = await subj.asResult({
        some: (val) => Ok(val + 1),
        none: Err("default")
      });
      const expected = Ok(6);
      await act.should.be.congruent(expected);
    });

    it("should evaluate the none case to obtain a result if Option is None with none non function", async function() {
      const subj: Option<string> = None();
      const act = await subj.asResult({
        some: (val) => Ok(val + 1),
        none: Err("default")
      });
      const expected = Err("default");
      await act.should.be.congruent(expected);
    });

  });

  // describe run
  describe("run", function() {

    it("should run the function as a side effect, but not capture the result, if its a Some", async function() {
      const subj = Some(5);
      let external = 6;
      const act = await subj.run((val) => {
        external += val + 1;
        return val + 1;
      });
      const expected = Some(5);
      external.should.equal(12);
      await act.should.be.congruent(expected);
    });

    it("should not run the function as a side effect, but not capture the result, if its a None", async function() {
      const subj: Option<number> = None();
      let external = 6;
      const act = await subj.run((val) => {
        external += val + 1;
        return val + 1;
      });
      const expected = None();
      external.should.equal(6);
      await act.should.be.congruent(expected);
    });

    // async
    it("should run the function as a side effect, but not capture the result, if its a Some with async", async function() {
      const subj = Some(5);
      let external = 6;
      const act = await subj.run((val) => {
        external += val + 1;
        return Promise.resolve(val + 1);
      });
      const expected = Some(5);
      external.should.equal(12);
      await act.should.be.congruent(expected);
    });

    it("should not run the function as a side effect, but not capture the result, if its a None with async", async function() {
      const subj: Option<number> = None();
      let external = 6;
      const act = await subj.run((val) => {
        external += val + 1;
        return Promise.resolve(val + 1);
      });
      const expected = None();
      external.should.equal(6);
      await act.should.be.congruent(expected);
    });

  });

  // describe native
  describe("native", function() {

    const someTheory = [
      { subject: Some(5), expected: 5 },
      { subject: Some("test"), expected: "test" },
      { subject: Some({ test: 5 }), expected: { test: 5 } },
      { subject: Some([5, 6, 7]), expected: [5, 6, 7] },
      { subject: Some(null), expected: null },
      { subject: Some(undefined), expected: undefined },
      { subject: Some(true), expected: true },
      { subject: Some(new Date(2019, 1, 1)), expected: new Date(2019, 1, 1) }

    ];

    someTheory.forEach(({ subject, expected }) => {
      it("should return the value if the option is Some", async function() {
        const act = await subject.native();
        expect(act).to.deep.equal(expected);
      });
    });

    it("should return null if the option is none", async function() {
      const subj: Option<number> = None();
      const act = await subj.native();
      expect(act).to.be.null;
    });

  });

});
