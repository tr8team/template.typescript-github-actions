import { should, it, describe } from "vitest";
import { UnwrapError } from "../../../src/lib/core/error.js";

should();

describe("UnwrapError", function() {

  describe("Monad Result Ok as Error", function() {
    const theory = [
      {
        subject: new UnwrapError("An error occurred", "result","Expected Ok got Error"),
        expected: {
          type: "Expected Ok got Error",
          message: "An error occurred",
          monadType: "result",
          name: "UnwrapError",
        }
      },
      {
        subject: new UnwrapError("Boom", "result","Expected Ok got Error"),
        expected: {
          type: "Expected Ok got Error",
          message: "Boom",
          monadType: "result",
          name: "UnwrapError",
        }
      },
      {
        subject: new UnwrapError("Something went wrong :(", "result","Expected Ok got Error"),
        expected: {
          type: "Expected Ok got Error",
          message: "Something went wrong :(",
          monadType: "result",
          name: "UnwrapError",
        }
      },
    ];
    theory.forEach(({ subject, expected }) => {
      it(`should contain the type of error with the message and the monad type`, function() {
        subject.should.have.property("type", expected.type);
        subject.should.have.property("message", expected.message);
        subject.should.have.property("monadType", expected.monadType);
        subject.should.have.property("name", expected.name);
      });
    });

  })

  describe("Monad Result Error as Ok", function() {
    const theory = [
      {
        subject: new UnwrapError("An error occurred", "result","Expected Err got Ok"),
        expected: {
          type: "Expected Err got Ok",
          message: "An error occurred",
          monadType: "result",
          name: "UnwrapError",
        }
      },
      {
        subject: new UnwrapError("Boom", "result","Expected Err got Ok"),
        expected: {
          type: "Expected Err got Ok",
          message: "Boom",
          monadType: "result",
          name: "UnwrapError",
        }
      },
      {
        subject: new UnwrapError("Something went wrong :(", "result","Expected Err got Ok"),
        expected: {
          type: "Expected Err got Ok",
          message: "Something went wrong :(",
          monadType: "result",
          name: "UnwrapError",
        }
      },
    ];
    theory.forEach(({ subject, expected }) => {
      it(`should contain the type of error with the message and the monad type`, function() {
        subject.should.have.property("type", expected.type);
        subject.should.have.property("message", expected.message);
        subject.should.have.property("monadType", expected.monadType);
        subject.should.have.property("name", expected.name);
      });
    });
  })

  describe("Monad Option None as Some", function() {
    const theory = [
      {
        subject: new UnwrapError("An error occurred", "option","Expected Some got None"),
        expected: {
          type: "Expected Some got None",
          message: "An error occurred",
          monadType: "option",
          name: "UnwrapError",
        }
      },
      {
        subject: new UnwrapError("Boom", "option","Expected Some got None"),
        expected: {
          type: "Expected Some got None",
          message: "Boom",
          monadType: "option",
          name: "UnwrapError",
        }
      },
      {
        subject: new UnwrapError("Something went wrong :(", "option","Expected Some got None"),
        expected: {
          type: "Expected Some got None",
          message: "Something went wrong :(",
          monadType: "option",
          name: "UnwrapError",
        }
      },
    ];
    theory.forEach(({ subject, expected }) => {
      it(`should contain the type of error with the message and the monad type`, function() {
        subject.should.have.property("type", expected.type);
        subject.should.have.property("message", expected.message);
        subject.should.have.property("monadType", expected.monadType);
        subject.should.have.property("name", expected.name);
      });
    });
  })
});
