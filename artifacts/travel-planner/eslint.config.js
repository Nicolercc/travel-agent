import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

/**
 * Architecture boundaries (RFC-001 §13.1). Type-only imports are allowed everywhere;
 * these rules forbid runtime coupling between layers.
 */
const restrict = (patterns) => ({
  "@typescript-eslint/no-restricted-imports": [
    "error",
    { patterns: patterns.map(([group, message]) => ({ group, message, allowTypeImports: true })) },
  ],
});

const DOMAIN_RULES = ["@/lib/domain/day-load", "@/lib/domain/planning-heuristics", "@/lib/domain/bookings", "@/lib/domain/legs", "@/lib/domain/validation", "@/lib/domain/trip-phase", "@/lib/domain/placement"];

export default tseslint.config(
  { ignores: ["dist/**", "e2e/**", "playwright.config.ts"] },
  ...tseslint.configs.recommended,
  reactHooks.configs.flat["recommended-latest"],
  jsxA11y.flatConfigs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/lib/domain/**"],
    // Pinned seed tests (RFC §16) may read the seed; domain source may not.
    ignores: ["src/lib/domain/**/*.test.ts"],
    rules: restrict([
      [["react", "@/lib/state*", "@/lib/persistence*", "@/lib/selectors*", "@/data/*", "@/components/*", "@/pages/*", "@/app/*"], "The domain is pure: it may import only itself and date-fns."],
    ]),
  },
  {
    files: ["src/data/**"],
    ignores: ["src/data/**/*.test.ts"],
    rules: restrict([[["react", "@/lib/state*", "@/lib/persistence*", "@/lib/selectors*", "@/components/*", "@/pages/*", "@/app/*"], "Seed data may import domain types only."]]),
  },
  {
    files: ["src/lib/persistence/**"],
    ignores: ["src/lib/persistence/**/*.test.ts"],
    rules: restrict([[["react", "@/lib/state*", "@/lib/selectors*", "@/data/*", "@/components/*", "@/pages/*", "@/app/*"], "Persistence may import domain and zod only; the seed and legacy map are passed in."]]),
  },
  {
    files: ["src/lib/state/**"],
    ignores: ["src/lib/state/**/*.test.*"],
    rules: restrict([[["@/lib/selectors*", "@/components/*", "@/pages/*", "@/app/*"], "State transitions must not depend on selectors or UI."]]),
  },
  {
    files: ["src/lib/selectors/**"],
    ignores: ["src/lib/selectors/**/*.test.ts"],
    rules: restrict([[["react", "@/lib/persistence*", "@/lib/state*", "@/components/*", "@/pages/*", "@/app/*"], "Selectors are pure derivations over domain + state."]]),
  },
  {
    files: ["src/components/**"],
    rules: restrict([
      [["@/lib/state*", "@/lib/selectors*", "@/lib/persistence*", "@/data/*", "@/pages/*"], "Components are presentational: props in, callbacks out."],
      [DOMAIN_RULES, "Components must not compute domain facts; receive them from a selector."],
    ]),
  },
  {
    files: ["src/pages/**", "src/app/**"],
    ignores: ["src/**/*.test.tsx", "src/app/ErrorBoundary.tsx"],
    rules: restrict([
      [["@/lib/persistence*", "@/data/seed/*"], "Pages read state through useTrip and selectors."],
      [DOMAIN_RULES, "Pages must not compute domain facts (INV-5); use a selector."],
    ]),
  },
);
