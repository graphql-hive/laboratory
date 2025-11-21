import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  dts: true,
  format: ["esm"],
  injectStyle: true,
  external: [
    "react",
    "react-dom",
    "lucide-react",
    "@tanstack/react-form",
    "zod",
    "lz-string",
    "graphql-ws",
    "date-fns"
  ],
});