const pluralize = (count, word) => `${count} ${word}${count !== 1 ? "s" : ""}`;

const summarizeList = (items, getLabel, fallbackLabel) => {
  const max = 2;

  if (!items.length) return null;

  const shown = items.slice(0, max).map(getLabel);
  const remaining = items.length - shown.length;

  if (shown.length) {
    return remaining > 0
      ? `${shown.join(", ")}, and ${pluralize(remaining, "other")}`
      : shown.join(", ");
  }

  return pluralize(items.length, fallbackLabel);
};

const generateSummary = ({ users = [], teams = [] }) => {
  if (!users.length && !teams.length) {
    return "Public – Everyone can view";
  }

  const userSummary = summarizeList(users, (u) => u.firstName, "person");

  const teamSummary = summarizeList(teams, (t) => t.name, "team");

  return `Shared with ${[userSummary, teamSummary]
    .filter(Boolean)
    .join(" · ")}`;
};

export { pluralize, summarizeList, generateSummary };
