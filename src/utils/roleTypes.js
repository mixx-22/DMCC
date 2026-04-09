export const ROLE_TYPE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "qmr", label: "QMR" },
  { value: "auditor", label: "Auditor" },
  { value: "teamLeader", label: "Team Leader" },
];

const ROLE_TYPE_COLOR = {
  admin: "red",
  qmr: "blue",
  auditor: "teal",
  teamLeader: "purple",
};

export const getRoleTypeLabel = (value) =>
  ROLE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;

export const getRoleTypeColor = (value) => ROLE_TYPE_COLOR[value] ?? "gray";
