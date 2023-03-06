import { afterAll, afterEach, describe, it, should, vi } from "vitest";
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

describe("GithubActionIO for ActionIO", function() {

  describe("get", function() {
    it("should retrieve action input values", async function() {
      // arrange
      const input = {
        name: "Ernest",
        age: "17"
      };
      const expected = {
        "debug": [
          {
            "content": "Hello Ernest!",
            "meta": {}
          },
          {
            "content": "You are 17 years old!",
            "meta": {}
          }
        ]
      };

      // act
      const output = await emulateAction({
        relativePath: [...actionScripts, "io", "get_write_debug.ts"],
        input
      }, f.emulate);

      // assert
      output.should.deep.equal(expected);
    });
    it("should return empty string if no input is placed", async function() {
      // arrange
      const expected = {
        "debug": [
          {
            "content": "Hello !",
            "meta": {}
          },
          {
            "content": "You are  years old!",
            "meta": {}
          }
        ]
      };
      // act
      const output = await emulateAction({
        relativePath: [...actionScripts, "io", "get_write_debug_2.ts"]
      }, f.emulate);

      // assert
      output.should.deep.equal(expected);
    });
  });

  describe("getObject", function() {
    describe("with validator", function() {
      it("should return error if its not a valid JSON", async function() {
        // arrange
        const input = {
          person: `<html>Not JSON</html>`
        };
        const expected = {
          "error": [
            {
              "content": "Unexpected token < in JSON at position 0",
              "meta": {}
            }
          ]
        };
        // act
        const output = await emulateAction({
          relativePath: [...actionScripts, "io", "get_object_write_debug.ts"],
          input
        }, f.emulate);

        // assert
        output.should.deep.equal(expected);
      });
      it("should return error if the validator fails", async function() {
        // arrange
        const input = {
          person: `{"name":"Ernest", "age": 19, "phone":88881234,"vaccinated":true, "address":{ "block":200, "door":"17-328", "street":"jane street" }}`
        };
        const expected = {
          "error": [
            {
              "content": `[%0A  {%0A    "code": "invalid_type",%0A    "expected": "string",%0A    "received": "number",%0A    "path": [%0A      "phone"%0A    ],%0A    "message": "Expected string, received number"%0A  }%0A]`,
              "meta": {}
            }
          ]
        };
        // act
        const output = await emulateAction({
          relativePath: [...actionScripts, "io", "get_object_write_debug_2.ts"],
          input
        }, f.emulate);

        // assert
        output.should.deep.equal(expected);
      });
      it("should return object if its a valid object", async function() {
        // arrange
        const input = {
          person: `{"name":"Ernest", "age": 19, "phone":"88881234","vaccinated":true, "address":{ "block":200, "door":"17-328", "street":"jane street" }}`
        };
        const expected = {
          "debug": [
            {
              "content": "Hello Ernest!",
              "meta": {}
            },
            {
              "content": "You are 19 years old!",
              "meta": {}
            },
            {
              "content": "You have taken the vaccine!",
              "meta": {}
            },
            {
              "content": "Your phone number is 88881234!",
              "meta": {}
            },
            {
              "content": "Your address is {\"block\":200,\"door\":\"17-328\",\"street\":\"jane street\"}!",
              "meta": {}
            }
          ]
        };
        // act
        const output = await emulateAction({
          relativePath: [...actionScripts, "io", "get_object_write_debug_3.ts"],
          input
        }, f.emulate);

        // assert
        output.should.deep.equal(expected);
      });
    });
    describe("without validator", function() {
      it("should return error if its not a valid JSON", async function() {
        // arrange
        const input = {
          person: `<html>Not JSON</html>`
        };
        const expected = {
          "error": [
            {
              "content": "Unexpected token < in JSON at position 0",
              "meta": {}
            }
          ]
        };
        // act
        const output = await emulateAction({
          relativePath: [...actionScripts, "io", "get_object_write_debug_without_validator.ts"],
          input
        }, f.emulate);

        // assert
        output.should.deep.equal(expected);
      });
      it("should return object if its a valid object", async function() {
        // arrange
        const input = {
          person: `{ "key1" : "val1" , "key2" : { "key3" : "val3" } }`
        };
        const expected = {
          debug: [
            {
              content: `{"key1":"val1","key2":{"key3":"val3"}}`,
              meta: {}
            }
          ]
        };
        // act
        const output = await emulateAction({
          relativePath: [...actionScripts, "io", "get_object_write_debug_without_validator_2.ts"],
          input
        }, f.emulate);

        // assert
        output.should.deep.equal(expected);
      });
    });
  });

  describe("set", function() {
    it("should set output", async function() {
      const expected = {
          "set-output": [
            {
              content: "random value 2",
              meta: {
                name: "first-key"
              }
            }
          ]
        }
      ;
      const output = await emulateAction({
        relativePath: [...actionScripts, "io", "set_string_output.ts"]
      }, f.emulate);
      output.should.deep.equal(expected);
    });
    it("should not set output if empty value was set", async function() {
      const expected = {
          "set-output": [
            {
              content: "",
              meta: {
                name: "first-key"
              }
            }
          ]
        }
      ;
      const output = await emulateAction({
        relativePath: [...actionScripts, "io", "set_empty_string_output.ts"]
      }, f.emulate);
      output.should.deep.equal(expected);
    });
  });

  describe("setObject", function() {
    it("should set output", async function() {
      const expected = {
        "set-output": [
          {
            content: `{"name":"Ernest","age":17}`,
            meta: {
              name: "first-key"
            }
          }
        ]
      };
      const output = await emulateAction({
        relativePath: [...actionScripts, "io", "set_object_output.ts"]
      }, f.emulate);
      output.should.deep.equal(expected);
    });
  });


});
