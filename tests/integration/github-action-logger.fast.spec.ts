import { should, describe, it, afterAll, afterEach, vi } from "vitest";

// @ts-ignore
import { actionScripts, backupStdOut, emulateAction } from "./helper.js";

should();

const f = backupStdOut();
afterAll(() => {
  f.restore();
});

afterEach(() => {
  vi.unstubAllEnvs();
})

describe("logger", function() {

  describe("debug", function() {
    it("should print debug logs", async function() {
      const output = await emulateAction({
        relativePath: [...actionScripts, "logger", "debug.ts"]
      }, f.emulate);

      output.should.deep.equal({
        debug: [
          {
            content: "hydrogen is 1",
            meta: {}
          }
        ]
      })
    });
  });

  describe("notice", function() {
    it("should print notice logs", async function() {
      const output = await emulateAction({
        relativePath: [...actionScripts, "logger", "notice.ts"]
      }, f.emulate);

      output.should.deep.equal({
        notice: [
          {
            content: "helium is 2",
            meta: {}
          }
        ]
      })
    });
  });

  describe("info", function() {
    it("should print info logs", async function() {
      const output = await emulateAction({
        relativePath: [...actionScripts, "logger", "info.ts"]
      }, f.emulate);
      output.should.deep.equal({
        info: [
          {
            content: "lithium is 3",
            meta: {}
          }
        ]
      })
    });
  });

  describe("warning", function() {
    it("should print warning logs", async function() {
      const output = await emulateAction({
        relativePath: [...actionScripts, "logger", "warning.ts"]
      }, f.emulate);

      output.should.deep.equal({
        warning: [
          {
            content: "beryllium is 4",
            meta: {}
          }
        ]
      })
    });
  });

  describe("error", function() {
    it("should print error logs", async function() {
      const output = await emulateAction({
        relativePath: [...actionScripts, "logger", "error.ts"]
      }, f.emulate);

      output.should.deep.equal({
        error: [
          {
            content: "boron is 5",
            meta: {}
          }
        ]
      })
    });
  });

  it("should print all kind of logs", async  function() {
    const output = await emulateAction({
      relativePath: [...actionScripts, "logger", "mix.ts"]
    }, f.emulate);

    output.should.deep.equal({
      debug: [
        {
          content: "H is Hydrogen with atomic number 1",
          meta: {}
        }
      ],
      notice: [
        {
          content: "He is Helium with atomic number 2",
          meta: {}
        }
      ],
      info: [
        {
          content: "Li is Lithium with atomic number 3",
          meta: {}
        }
      ],
      warning: [
        {
          content: "Be is Beryllium with atomic number 4",
          meta: {}
        }
      ],
      error: [
        {
          content: "B is Boron with atomic number 5",
          meta: {}
        }
      ],
    })
  });

});
