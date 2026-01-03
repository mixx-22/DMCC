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

  return `limited access (${enabled.map((a) => ACTIONS[a]).join(", ")})`;
}

function generateRoleDescriptions(permissions = {}) {
  const longLines = [];
  const shortParts = [];

  let fullControlCount = 0;
  let moduleCount = 0;

  Object.entries(permissions).forEach(([module, config]) => {
    const { permission, ...crud } = config;
    const moduleName = prettify(module);
    const summary = getCrudSummary(crud);

    moduleCount++;
    if (summary === "full control") fullControlCount++;

    longLines.push(`• ${moduleName}: ${summary}`);

    if (summary !== "no access") {
      shortParts.push(
        summary === "full control" ? moduleName : `${moduleName} (${summary})`
      );
    }

    if (permission) {
      Object.entries(permission).forEach(([sub, subCrud]) => {
        const subName = prettify(sub);
        const subSummary = getCrudSummary(subCrud);
        longLines.push(`  – ${subName}: ${subSummary}`);
      });
    }
  });

  // Short description logic
  let shortDescription;
  if (fullControlCount === moduleCount) {
    shortDescription = "Full control across all system modules.";
  } else if (shortParts.length <= 3) {
    shortDescription = `Manages ${shortParts.join(", ")}.`;
  } else {
    shortDescription = `Manages ${shortParts
      .slice(0, 3)
      .join(", ")}, and more.`;
  }

  return {
    short: shortDescription,
    long:
      fullControlCount === moduleCount
        ? "Full control over all system modules and records."
        : "Access permissions include:\n" + longLines.join("\n"),
  };
}

export { generateRoleDescriptions };
