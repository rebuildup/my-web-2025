import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "src/app/tools/ProtoType/prototype-src/**/*",
      "temp_archive/**/*",
      ".next/**/*",
      "out/**/*",
      "build/**/*",
      "dist/**/*",
      "node_modules/**/*",
    ],
  },
  {
    files: ["**/__tests__/**/*", "**/*.test.*", "tests/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "prefer-const": "warn",
    },
  },
  {
    plugins: {
      tailwindcss: (await import("eslint-plugin-tailwindcss")).default,
    },
    rules: {
      "tailwindcss/classnames-order": "off", // Disable classnames order warnings
      "tailwindcss/enforces-negative-arbitrary-values": "off", // Disable for v4 compatibility
      "tailwindcss/enforces-shorthand": "warn",
      "tailwindcss/migration-from-tailwind-2": "off",
      "tailwindcss/no-arbitrary-value": "off",
      "tailwindcss/no-custom-classname": "off", // Disable for Tailwind CSS v4 compatibility
      "tailwindcss/no-contradicting-classname": "error",
    },
    settings: {
      tailwindcss: {
        config: false, // Disable config resolution for v4
        cssFiles: [],
        whitelist: [],
      },
    },
  },
];

export default eslintConfig;
