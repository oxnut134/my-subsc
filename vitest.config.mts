import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // tsconfig.json の paths("@/*")をテストでも解決する
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
  },
});
