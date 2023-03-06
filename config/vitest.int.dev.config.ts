import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "Integration Test",
    dir: "tests/integration",
    include: ["**/*.spec.ts"],
    reporters: ["default"],
    testTimeout: 30000,
    threads: true,
    isolate: true,
    unstubEnvs: true,
    coverage: {
      all: true,
      include: ["src/external/**/*.?([mc])[tj]s?(x)"],
      provider: "istanbul",
      reporter: ["text"]
    }
  }
});
