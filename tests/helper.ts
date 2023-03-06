import { Assertion, expect, should } from "chai";
import { Result } from "../src/lib/core/result.js";
import { Option } from "../src/lib/core/option.js";
import ChaiPlugin = Chai.ChaiPlugin;
import ChaiStatic = Chai.ChaiStatic;
import ChaiUtils = Chai.ChaiUtils;
import deepEqual from "@kirinnee/deep-eql";

should();
declare global {
  export namespace Chai {
    interface Assertion {
      congruent(any: any): Assertion;

      okOf<T, E>(r: T): Assertion;

      errOf<T, E>(e: E): Assertion;

      someOf<T>(t: T): Assertion;

      errErrorMessage(s: string): Assertion;

      monadicly: Assertion;

      ok: Assertion;

      err: Assertion;

      some: Assertion;

      none: Assertion;
    }
  }
}


const plugin: ChaiPlugin = function(_: ChaiStatic, utils: ChaiUtils) {

  // Result Utility
  function isResult<T, E>(obj: unknown): obj is Result<T, E> {
    return (
      typeof obj === "object"
      && obj != null
      && "unwrap" in obj
      && "isOk" in obj
      && "isErr" in obj
      && "native" in obj
      && typeof obj["unwrap"] === "function"
      && typeof obj["isOk"] === "function"
      && typeof obj["isErr"] === "function"
      && typeof obj["native"] === "function"
    );
  }

  async function resultEquality<T, E>(a: Result<T, E>, b: Result<T, E>, de: deepEqual.DE, comparator: deepEqual.Comparator): Promise<boolean> {
    const aOk = await a.isOk();
    const bOk = await b.isOk();
    if (aOk === bOk) {
      const aa = await a.native();
      const bb = await b.native();
      return de(aa, bb, { comparator });
    }
    return false;
  }

  function assertResult<T, E>(subj: unknown): Result<T, E> {
    if (isResult<T, E>(subj)) {
      return subj;
    } else {
      throw new TypeError(utils.inspect(subj) + "is not a result");
    }
  }


  function resultProperty<T, E>(name: string, f: (caller: any, act: Result<T, E>) => any) {
    utils.addProperty(Assertion.prototype, name, function() {

      // @ts-ignore
      const parent = this;

      const subj: unknown = parent._obj as any as unknown;
      const a = assertResult<T, E>(subj);
      return f(parent, a);
    });
  }

  function resultMethod<T, E>(name: string, f: (caller: any, act: Result<T, E>, ex: any) => any) {
    Assertion.addMethod(name, function(r: any) {
      // @ts-ignore
      const parent = this;

      const subj: unknown = parent._obj as any as unknown;
      const a = assertResult<T, E>(subj);
      return f(parent, a, r);
    });
  }

  // Option Utility
  async function optionEquality<T>(a: Option<T>, b: Option<T>, de: deepEqual.DE, comparator: deepEqual.Comparator): Promise<boolean> {
    const aOk = await a.isSome();
    const bOk = await b.isSome();
    if (aOk === bOk) {
      if (!aOk) {
        return true;
      }
      const aa = await a.native();
      const bb = await b.native();
      return de(aa, bb, { comparator });
    }
    return false;
  }


  function isOption<T>(obj: unknown): obj is Option<T> {
    return (
      typeof obj === "object"
      && obj != null
      && "unwrap" in obj
      && "isSome" in obj
      && "isNone" in obj
      && "native" in obj
      && typeof obj["unwrap"] === "function"
      && typeof obj["isSome"] === "function"
      && typeof obj["isNone"] === "function"
      && typeof obj["native"] === "function"
    );
  }

  type NativeMonad<T, O, E> = {
    type: "some" | "none" | "ok" | "err",
    value: T | O | E | null,
  }
  async function nativeMonad<T,O,E>(a: Option<T> | Result<O, E>): Promise<NativeMonad<T,O,E>> {
    const value = await a.native();
    if (isOption(a)) {
      const isSome = await a.isSome();
      return {
        type: isSome ? "some" : "none",
        value,
      }

    } else if (isResult(a)) {
      const isOk = await a.isOk();
      return {
        type: isOk ? "ok" : "err",
        value,
      }
    } else {
      throw new TypeError("Not an option or result");
    }
  }
  async function fullUnwrap(a: unknown): Promise<unknown> {

    if (typeof a === "object") {
      if (isOption(a) || isResult(a)) {
        const nat = nativeMonad(a);
        return fullUnwrap(nat);
      }
      if(Array.isArray(a)) {
        const ret = [];
        for (let i = 0; i < a.length; i++) {
          // @ts-ignore
          if (typeof a[i] === "object") {
            // @ts-ignore
            if (isOption(a[i]) || isResult(a[i])) {
              // @ts-ignore
              const nat = await nativeMonad(a[i]);
              const u = await fullUnwrap(nat);
              ret.push(u);
            } else {
              // @ts-ignore
              const u = await fullUnwrap(a[i]);
              ret.push(u)
            }
          } else {
            // @ts-ignore
            ret.push(a[i]);
          }
        }
        return ret;
      } else {
        const r = Object.create({});
        for (let k in a) {
          // @ts-ignore
          if (typeof a[k] === "object") {
            // @ts-ignore
            if (isOption(a[k]) || isResult(a[k])) {
              // @ts-ignore
              const nat = await nativeMonad(a[k]);
              const u = await fullUnwrap(nat);
              Object.assign(r, { [k]: u });
            } else {
              //@ts-ignore
              const u = await fullUnwrap(a[k]);
              Object.assign(r, { [k]: u });
            }
          } else {
            // @ts-ignore
            Object.assign(r, { [k]: a[k] });
          }
        }
        return r;
      }

    }

    return a;

  }

  function assertOption<T>(subj: unknown): Option<T> {
    if (isOption<T>(subj)) {
      return subj;
    } else {
      throw new TypeError(utils.inspect(subj) + "is not an option");
    }
  }

  function optionProperty<T>(name: string, f: (caller: any, act: Option<T>) => any) {
    utils.addProperty(Assertion.prototype, name, function() {
      // @ts-ignore
      const parent = this;

      const subj: unknown = parent._obj as any as unknown;
      const a = assertOption<T>(subj);
      return f(parent, a);
    });
  }


  function optionMethod<T>(name: string, f: (caller: any, act: Option<T>, ex: any) => any) {
    Assertion.addMethod(name, function(r: any) {
      // @ts-ignore
      const parent = this;

      const subj: unknown = parent._obj as any as unknown;
      const a = assertOption<T>(subj);
      return f(parent, a, r);
    });
  }

  // Generic Utility
  function genericComparator<T>(typeComparator: (a: unknown) => a is T, valueComparator: (a: T, b: T, e: deepEqual.DE, c: deepEqual.Comparator) => Promise<boolean>):
    (a: unknown, b: unknown, e: deepEqual.DE, c: deepEqual.Comparator) => Promise<boolean | null> {
    return async (a, b, e, c) => {
      const aT = typeComparator(a);
      const bT = typeComparator(b);
      if (aT && bT) {
        return valueComparator(a, b, e, c);
      }
      return null;
    };
  }

  const resultCompare = genericComparator(isResult, resultEquality);
  const optionCompare = genericComparator(isOption, optionEquality);


  const resultOptionEqual = async (a1: unknown, b1: unknown): Promise<boolean> => {
    return await deepEqual(a1, b1, {
      comparator: async (a, b, e, c): Promise<boolean | null> => {
        const result = await resultCompare(a, b, e, c);
        if (result === true || result === false) {
          return result;
        }
        return await optionCompare(a, b, e, c);
      }
    });
  };

  // Chai Extensions

  Assertion.addMethod("congruent", async function(ex: any) {
    // @ts-ignore
    const parent = this;

    const subj: unknown = parent._obj as any as unknown;
    const r = await resultOptionEqual(subj, ex);

    let a = subj;
    let e = ex;
    if (isResult(subj) && isResult(ex)) {
      a = await subj.native();
      e = await ex.native();
    }
    if (isOption(ex) && isOption(subj)) {
      e = await ex.native();
      a = await subj.native();
    }
    const aa = await fullUnwrap(a);
    const ee = await fullUnwrap(e);


    return parent.assert(
      r,
      "expected #{this} to deeply equal #{exp}",
      "expected #{this} to not deeply equal #{exp}",
      ee,
      aa,
      true
    );
  });


  resultMethod<unknown, Error>("errErrorMessage", async <T>(parent: any, a: Result<T, Error>, e: string) => {
    const ok = await a.isErr();

    expect(ok, "Expect Ok to be Err").to.be.true;

    const r = await a.unwrapErr();
    expect(r).to.be.instanceof(Error);

    return parent.assert(
      r.message === e,
      "expected #{this} to equal #{exp}",
      "expected #{this} to not equal #{exp}",
      e,
      r.message,
      true
    );
  });


  optionProperty("some", async function(parent, a) {
    const ok = await a.isSome();
    return parent.assert(
      ok,
      "expected #{this} to be Some",
      "expected #{this} to not be Some",
      true,
      ok,
      true
    );
  });
  optionProperty("none", async function(parent, a) {
    const ok = await a.isNone();
    return parent.assert(
      ok,
      "expected #{this} to be None",
      "expected #{this} to not be None",
      true,
      ok,
      true
    );
  });

  resultProperty("err", async function(parent, a) {
    const err = await a.isErr();
    return parent.assert(
      err,
      "expected #{this} to be Err",
      "expected #{this} to not be err",
      true,
      err,
      true
    );
  });
  resultProperty("ok", async function(parent, a) {
    const ok = await a.isOk();
    return parent.assert(
      ok,
      "expected #{this} to be Ok",
      "expected #{this} to not be Ok",
      true,
      ok,
      true
    );
  });

  optionMethod("someOf", async <T>(parent: any, a: Option<T>, e: T) => {
    const ok = await a.isSome();

    if (ok) {
      const act = await a.unwrap();
      const equal = await resultOptionEqual(act, e);
      return parent.assert(
        equal,
        "expected #{this} to be Some(#{exp})",
        "expected #{this} to not be Some(#{exp})",
        e,
        act,
        true
      );
    } else {
      return parent.assert(
        false,
        "expected #{this} to be Some(#{exp})",
        "expected #{this} to not be Some(#{exp})",
        e,
        a,
        true
      );
    }


  });


  resultMethod("errOf", async <T, E>(parent: any, a: Result<T, E>, e: E) => {
    const ok = await a.isErr();
    if (ok) {
      const act = await a.unwrapErr();
      const equal = await resultOptionEqual(act, e);
      return parent.assert(
        equal,
        "expected #{this} to be Err(#{exp})",
        "expected #{this} to not be Err(#{exp})",
        e,
        act,
        true
      );
    } else {
      return parent.assert(
        false,
        "expected #{this} to be Err(#{exp})",
        "expected #{this} to not be Err(#{exp})",
        e,
        a,
        true
      );
    }
  });

  resultMethod("okOf", async <T, E>(parent: any, a: Result<T, E>, e: T) => {
    const ok = await a.isOk();
    if (ok) {
      const act = await a.unwrap();
      const equal = await resultOptionEqual(act, e);
      return parent.assert(
        equal,
        "expected #{this} to be Ok(#{exp})",
        "expected #{this} to not be Ok(#{exp})",
        e,
        act,
        true
      );
    } else {
      return parent.assert(
        false,
        "expected #{this} to be Ok(#{exp})",
        "expected #{this} to not be Ok(#{exp})",
        e,
        a,
        true
      );
    }
  });

};

export default plugin;
