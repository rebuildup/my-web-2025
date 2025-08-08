module.exports = {
  extends: ["./eslint.config.mjs"],
  overrides: [
    {
      files: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-require-imports": "off",
        "@next/next/no-assign-module-variable": "off",
        "jsx-a11y/alt-text": "off",
      },
    },
  ],
};
