/**
 * Enforces the module-boundary and Clean Architecture layering rules from
 * SAD §4 and §6.1 as a CI-checkable gate, not just a documented convention.
 * Run via `npm run arch:check`.
 */
module.exports = {
  forbidden: [
    {
      name: "no-cross-module-reach-into-internals",
      comment:
        "A module's domain/application/infrastructure layers are private " +
        "to that module (SAD §4). Other code may only import its " +
        "interface layer. The composition root is the one deliberate " +
        "exception — its entire job is wiring Infrastructure into " +
        "Application across every module (SAD §6.1).",
      severity: "error",
      from: {
        pathNot: ["^src/modules/([^/]+)/", "^src/composition-root\\.ts$"],
      },
      to: {
        path: "^src/modules/([^/]+)/(domain|application|infrastructure)/",
      },
    },
    {
      name: "domain-layer-has-no-outward-dependencies",
      comment:
        "Clean Architecture's core rule: Domain depends on nothing else " +
        "in the system — no Application, Infrastructure, or Interface " +
        "imports, and no framework imports (SAD §6.1).",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/domain/" },
      to: {
        path: [
          "^src/modules/([^/]+)/(application|infrastructure|interface)/",
          "^node_modules/(next|react|drizzle-orm|postgres)",
        ],
      },
    },
    {
      name: "application-layer-does-not-import-infrastructure-or-interface",
      comment:
        "Application depends on ports it defines, not concrete " +
        "Infrastructure implementations or the Interface layer " +
        "(Dependency Inversion, SAD §6.1). Infrastructure is wired in " +
        "only at the composition root.",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/application/" },
      to: { path: "^src/modules/([^/]+)/(infrastructure|interface)/" },
    },
    {
      name: "no-direct-db-driver-outside-infrastructure",
      comment:
        "Only a module's infrastructure layer (or the shared DB client " +
        "it wraps) may import the DB driver directly — every other " +
        "layer depends on a port instead (SAD §6.1's Repository Pattern " +
        "rule).",
      severity: "error",
      from: {
        pathNot: [
          "^src/modules/([^/]+)/infrastructure/",
          "^src/shared/infrastructure/",
        ],
      },
      to: { path: "^node_modules/(drizzle-orm|postgres)" },
    },
    {
      name: "no-circular-dependencies",
      comment: "A circular import is always a design smell here.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "ai-provider-sdk-confined-to-adapter",
      comment:
        "SAD §7.1: 'Application code never imports a provider SDK " +
        "directly outside a module's own adapter — enforced by a lint " +
        "rule restricting provider-SDK imports to the " +
        "/ai-gateway/adapters/* directory.' This codebase's equivalent " +
        "location is src/modules/ai/infrastructure/adapters/ — every " +
        "other call site goes through the AIGatewayPort instead, so a " +
        "provider swap is one new adapter file, not a codebase-wide " +
        "search-and-replace.",
      severity: "error",
      from: { pathNot: "^src/modules/ai/infrastructure/adapters/" },
      to: { path: "^node_modules/@anthropic-ai/" },
    },
  ],
  options: {
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
    exclude: {
      path: "^(node_modules|\\.next|\\.git)",
    },
  },
};
