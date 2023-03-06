import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "Integration Test",
    dir: "tests/integration",
    include: ["**/*.spec.ts"],
    reporters: ["basic","html", "json"],
    testTimeout: 30000,
    outputFile: {
      html: "test-results/int/html/index.html",
      json: "test-results/int/result.json"
    },
    threads: true,
    isolate: true,
    unstubEnvs: true,
    coverage: {
      all: true,
      include: ["src/external/**/*.?([mc])[tj]s?(x)"],
      provider: "istanbul",
      reporter: ["text-summary","html", "json-summary"],
      reportsDirectory: "./test-results/int/coverage"
    }
  }
});
