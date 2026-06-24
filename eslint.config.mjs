import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: ["node_modules/**", ".next/**", "dist/**", "legacy/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslintPluginPrettier,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];
