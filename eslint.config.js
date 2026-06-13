import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  ...tseslint.configs.recommended,
  prettier, // MUST be last — turns off ESLint rules that conflict with Prettier
  { ignores: ['node_modules', 'drizzle', 'dist'] },
);
