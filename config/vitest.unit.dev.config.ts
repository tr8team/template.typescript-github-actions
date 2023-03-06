import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "Unit Test",
    dir: "tests/unit",
    include: ["**/*.spec.ts"],
    reporters: ["default"],
    coverage: {
      all: true,
      include: ["src/lib/**/*.?([mc])[tj]s?(x)"],
      provider: "istanbul",
      reporter: ["text"]
    }
  }
});
