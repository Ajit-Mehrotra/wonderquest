import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";


export default [
  {files: ["**/*.{js,mjs,cjs,jsx}"]},
  {languageOptions: 
    { globals: globals.browser }},
  {rules:{
    ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.flat.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginImport.configs.recommended.rules,
      "react/prop-types": "off", // Disable prop-types as we may be using TypeScript
      "react/react-in-jsx-scope": "off", // Not needed for React 17+
      "react/jsx-uses-react": "off", // Not needed for React 17+
      "import/no-unresolved": "error", // Catch missing imports
      "import/order": ["error", { // Enforce consistent import order
        "groups": [["builtin", "external", "internal"]],
        "newlines-between": "always",
      }],
      "react/jsx-uses-vars": "error", // Prevent variables used in JSX from being incorrectly marked as unused
      "react-hooks/rules-of-hooks": "error", // Checks rules of hooks
      "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn on unused variables, except those prefixed with _
    
  }}
];