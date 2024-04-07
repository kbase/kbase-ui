import pluginJs from "@eslint/js";
import pluginReactRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import globals from "globals";
import tseslint from "typescript-eslint";


export default [
  {languageOptions: { 
    globals: globals.browser,
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        }
    }
}},
  {
    settings: {
        react: {
            version: "18.2.0"
        }
    }
  },
  // Basic JS 
  pluginJs.configs.recommended,
  // Typescript
  ...tseslint.configs.recommended,
  // React
  pluginReactConfig,
  pluginReactRuntime,
];