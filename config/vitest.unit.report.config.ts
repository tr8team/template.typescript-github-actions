import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "Unit Test",
    dir: "tests/unit",
    include: ["**/*.spec.ts"],
    reporters: ["basic","html", "json"],
    outputFile: {
      html: "test-results/unit/html/index.html",
      json: "test-results/unit/result.json"
    },
    coverage: {
      all: true,
      include: ["src/lib/**/*.?([mc])[tj]s?(x)"],
      provider: "istanbul",
      reporter: ["text-summary","html", "json-summary"],
      reportsDirectory: "./test-results/unit/coverage"
    }
  }
});
