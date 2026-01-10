const ACTIONS = {
  c: "create",
  r: "view",
  u: "update",
  d: "delete",
};

const prettify = (text) =>
  text
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

function getCrudSummary(crud = {}) {
  const enabled = Object.keys(ACTIONS).filter((k) => crud[k] === 1);

  if (enabled.length === 4) return "full control";
  if (enabled.length === 0) return "no access";
  if (enabled.length === 1 && enabled[0] === "r") return "view-only access";

  return `Limited access (${enabled.map((a) => ACTIONS[a]).join(", ")})`;
}

function joinList(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function generateRoleDescriptions(permissions = {}) {
  // Catch: no permissions object or empty
  if (!permissions || Object.keys(permissions).length === 0) {
    return {
      short: "No permissions assigned.",
      long: "This role currently has no permissions configured.",
    };
  }

  const summaryGroups = {}; // { summary: [ModuleName] }
  const longLines = [];
  let moduleCount = 0;
  let fullControlCount = 0;

  Object.entries(permissions).forEach(([module, config]) => {
    const { permission, ...crud } = config || {};
    const moduleName = prettify(module);
    const summary = getCrudSummary(crud);

    moduleCount++;
    if (summary === "full control") fullControlCount++;

    // Group for short description
    if (!summaryGroups[summary]) summaryGroups[summary] = [];
    summaryGroups[summary].push(moduleName);

    // Long description (per module)
    longLines.push(`• ${moduleName}: ${summary}`);

    if (permission) {
      Object.entries(permission).forEach(([sub, subCrud]) => {
        const subName = prettify(sub);
        const subSummary = getCrudSummary(subCrud);
        longLines.push(`  – ${subName}: ${subSummary}`);
      });
    }
  });

  // ---------- SHORT DESCRIPTION ----------
  let shortDescription;

  if (fullControlCount === moduleCount) {
    shortDescription = "Full control across all system modules.";
  } else {
    const parts = [];

    Object.entries(summaryGroups).forEach(([summary, modules]) => {
      if (summary === "no access") return;

      const moduleList = joinList(modules);

      if (summary === "full control") {
        parts.push(`Full control over ${moduleList}`);
      } else if (summary === "view-only access") {
        parts.push(`View-only access to ${moduleList}`);
      } else {
        parts.push(`${summary} for ${moduleList}`);
      }
    });

    shortDescription =
      parts.length > 0
        ? parts.join(". ") + "."
        : "No effective permissions assigned.";
  }

  // ---------- LONG DESCRIPTION ----------
  const longDescription =
    fullControlCount === moduleCount
      ? "Full control over all system modules and records."
      : "Access permissions include:\n" + longLines.join("\n");

  return {
    short: shortDescription,
    long: longDescription,
  };
}

export { generateRoleDescriptions };
