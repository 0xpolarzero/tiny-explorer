import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    testTimeout: 10000,
    reporters: ["default", "hanging-process"],
    alias: {
      "@/*": "./src/*",
      "@bin/*": "./bin/*",
      "@test/*": "./__test__/*",
    },
  },
});
