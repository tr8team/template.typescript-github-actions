# Create a JavaScript Action using TypeScript

Use this template to bootstrap the creation of a TypeScript action.:rocket:

This README should be deleted, and you can use README.tpl.MD to replace this
README file. All development instructions below already existing in [Contributing.MD](./Contributing.md)
so you don't have to worry.

This is just a reference list of the tools and packages used to development,
testing and quality assurance. The installation of these packages are fully
isolated and automated using the nix technology.

- [Nix](https://nixos.org/)
- [direnv](https://direnv.net/)
- [Taskfile](https://taskfile.dev/)
- [Vitest](https://vitest.dev/)
- Dependabot
- [Semantic Releaser](https://semantic-release.gitbook.io/semantic-release/usage/configuration) with [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/)
- Linters
  - [ES Lint](https://eslint.org/)
  - [shellcheck](https://www.shellcheck.net/)
  - [gitlint](https://jorisroovers.com/gitlint/)
- Formatters
  - [shfmt](https://github.com/mvdan/sh)
  - [prettier](https://prettier.io/)
  - [nixpkgs-fmt](https://github.com/nix-community/nixpkgs-fmt)
- [Pre-commit](https://pre-commit.com/)

## Create an action from this template

Click the `Use this Template` and provide the new repo details for your action

## Pre-requisite

All dependencies are pre-install via `nix` and activated via `direnv`

- [Nix](https://nixos.org/) > 2.12.0
- [direnv](https://direnv.net/) > 2.23.2
- [Docker](https://hub.docker.com/)

## Get Started

Ensure that you are logged into AWS with access to the correct
secrets manager.

Setup the repository. This is automatically executed if you have `direnv`

```
pls setup
```

Running unit tests

```
pls test
```

## Development

The task runner has convenience commands for development

| Action                               | Command           |
| ------------------------------------ | ----------------- |
| Setup the repository                 | `pls setup`       |
| Force re-setup by invalidating cache | `pls setup:force` |
| Build the project                    | `pls build`       |
| Clean all artifacts                  | `pls clean`       |

## Testing

The task runner has convenience commands for testing

| Action                    | Command               | Alias            |
| ------------------------- | --------------------- | ---------------- |
| Run unit test             | `pls test:unit`       | `pls test`       |
| Watch unit test           | `pls test:unit:watch` | `pls test:watch` |
| Unit Test Coverage        | `pls test:unit:cover` | `-`              |
| Run integration test      | `pls test:int`        | `-`              |
| Watch integration test    | `pls test:int:watch`  | `-`              |
| Integration Test Coverage | `pls test:int:cover`  | `-`              |
| Generate Test Reports     | `pls test:report`     | `-`              |

You can additionally filter tests by adding the filter (contains):

```bash
pls test:int -- fast
```

The above will only run test file names containing the word `fast`

You can check `Taskfile.yml` and `scripts` folder for more commands.

## Quality Assurance

The task runner has convenience commands for basic quality assurance

| Action                   | Command              |
| ------------------------ | -------------------- |
| Run all Checks           | `pls check`          |
| Run all enforcers        | `pls enforce`        |
| Run all formatters       | `pls fmt`            |
| Run all linters          | `pls lint`           |
| Run a specific enforcer  | `pls enforce:<type>` |
| Run a specific formatter | `pls fmt:<type>`     |
| Run a specific linter    | `pls lint:<type>`    |

You can check `Taskfile.yml` and `scripts` folder for more commands.

## Working with CI

This template comes with in-built tools to debug CI.
CI Checks include:

- Build
- Pre Commit
- Unit Test
- Integration Test

### Dropping into an emulated environment

To enter an isolated CI-like environment to play around or test, run:

```
pls ci:isolate
```

If you require to enter the `nix-shell` under the `ci` attribute, you can run:

```
pls ci:isolate:nix-shell
```

### Build

This ensures that the commit can be built by compiling TypeScript to JavaScript and using ncc to merge into a single distributable file.

| Action                                                  | Command                |
| ------------------------------------------------------- | ---------------------- |
| Execute Build locally                                   | `pls ci:build`         |
| Execute Build in fully emulated CI Environment          | `pls ci:build:emulate` |
| Execute Build and drop in fully emulated CI Environment | `pls ci:build:debug`   |

### Pre-Commit

This ensures that the commit passes all pre-commit checks, such as linting and formatting

| Action                                                       | Command                     |
| ------------------------------------------------------------ | --------------------------- |
| Execute Pre-Commit locally                                   | `pls ci:pre-commit`         |
| Execute Pre-Commit in fully emulated CI Environment          | `pls ci:pre-commit:emulate` |
| Execute Pre-Commit and drop in fully emulated CI Environment | `pls ci:pre-commit:debug`   |

### Unit Test

Execute all unit tests and generates the report for downstream CI to consume

| Action                                                       | Command                    |
| ------------------------------------------------------------ | -------------------------- |
| Execute Unit tests locally                                   | `pls ci:unit-test`         |
| Execute Unit tests in fully emulated CI Environment          | `pls ci:unit-test:emulate` |
| Execute Unit tests and drop in fully emulated CI Environment | `pls ci:unit-test:debug`   |

### Integration Test

Execute all unit tests and generates the report for downstream CI to consume

| Action                                                              | Command                           |
| ------------------------------------------------------------------- | --------------------------------- |
| Execute Integration tests locally                                   | `pls ci:integration-test`         |
| Execute Integration tests in fully emulated CI Environment          | `pls ci:integration-test:emulate` |
| Execute Integration tests and drop in fully emulated CI Environment | `pls ci:integration-test:debug`   |

## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
import * as core from "@actions/core";

// ...

async function run() {
  try {
    // ...
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Publishing an action

This repository has configured Semantic Releaser with conventional commits. By simply merging to the `main` branch, the action will automatically be released.
