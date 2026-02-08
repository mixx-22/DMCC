import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  VStack,
  Hide,
  Show,
} from "@chakra-ui/react";
import { Fragment } from "react";

const PERMISSION_LABELS = {
  c: "Create",
  r: "Read",
  u: "Update",
  d: "Delete",
};

const MODULES = [
  {
    key: "users",
    label: "Users",
    description: "Manage user accounts and profiles",
    level: 0,
    path: "users",
  },
  {
    key: "teams",
    label: "Teams",
    description: "Manage teams and team memberships",
    level: 0,
    path: "teams",
  },
  {
    key: "teams.permissions.objective",
    label: "Objectives",
    description: "Manage team objectives",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Create Objectives";
        case "r":
          return "View Objectives";
        case "u":
          return "Update Objectives";
        case "d":
          return "Delete Objectives";
        default:
          return `${PERMISSION_LABELS[action]} Objectives`;
      }
    },
    path: "teams.objective",
  },
  {
    key: "document",
    label: "Document",
    description: "Manage documents",
    level: 0,
    path: "document",
  },
  {
    key: "document.permissions.archive",
    label: "Archive",
    description: "Archive and unarchive documents",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Archive Documents";
        case "r":
          return "View Archived Documents";
        default:
          return `${PERMISSION_LABELS[action]} Archived Documents`;
      }
    },
    path: "document.archive",
  },
  {
    key: "document.permissions.download",
    label: "Download",
    description: "Download documents",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Download Documents";
        case "r":
          return "View Downloadable Documents";
        default:
          return `${PERMISSION_LABELS[action]} Downloadable Documents`;
      }
    },
    path: "document.download",
  },
  {
    key: "document.permissions.preview",
    label: "Preview",
    description: "Preview documents",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Preview Documents";
        case "r":
          return "View Document Previews";
        default:
          return `${PERMISSION_LABELS[action]} Document Previews`;
      }
    },
    path: "document.preview",
  },
  {
    key: "request",
    label: "Request",
    description: "Manage document review requests",
    level: 0,
    path: "request",
  },
  {
    key: "request.permissions.publish",
    label: "Publish",
    description: "Manage document publish requests",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Create Publish Requests";
        case "r":
          return "View Publish Requests";
        case "u":
          return "Update Publish Requests";
        case "d":
          return "Delete Publish Requests";
        default:
          return `${PERMISSION_LABELS[action]} Publish Requests`;
      }
    },
    path: "request.publish",
  },
  {
    key: "request.permissions.approval",
    label: "Approval",
    description: "Manage document approval requests",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Create Approval Requests";
        case "r":
          return "View Approval Requests";
        case "u":
          return "Update Approval Requests";
        case "d":
          return "Delete Approval Requests";
        default:
          return `${PERMISSION_LABELS[action]} Approval Requests`;
      }
    },
    path: "request.approval",
  },
  {
    key: "audit",
    label: "Audit",
    description: "Manage audit module access",
    level: 0,
    path: "audit",
  },
  {
    key: "audit.permissions.schedule",
    label: "Schedule",
    description: "Manage audit schedules",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Create Audit Schedules";
        case "r":
          return "View Audit Schedules";
        case "u":
          return "Update Audit Schedules";
        case "d":
          return "Delete Audit Schedules";
        default:
          return `${PERMISSION_LABELS[action]} Audit Schedules`;
      }
    },
    path: "audit.schedule",
  },
  {
    key: "audit.permissions.findings",
    label: "Findings",
    description: "Manage audit findings",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Create Audit Findings";
        case "r":
          return "View Audit Findings";
        case "u":
          return "Update Audit Findings";
        case "d":
          return "Delete Audit Findings";
        default:
          return `${PERMISSION_LABELS[action]} Audit Findings`;
      }
    },
    path: "audit.findings",
  },
  {
    key: "audit.permissions.response",
    label: "Response",
    description: "Manage audit responses",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Create Audit Responses";
        case "r":
          return "View Audit Responses";
        case "u":
          return "Update Audit Responses";
        case "d":
          return "Delete Audit Responses";
        default:
          return `${PERMISSION_LABELS[action]} Audit Responses`;
      }
    },
    path: "audit.response",
  },
  {
    key: "audit.permissions.organizations",
    label: "Organizations",
    description: "Manage audit organizations",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Create Audit Organizations";
        case "r":
          return "View Audit Organizations";
        case "u":
          return "Update Audit Organizations";
        case "d":
          return "Delete Audit Organizations";
        default:
          return `${PERMISSION_LABELS[action]} Audit Organizations`;
      }
    },
    path: "audit.organizations",
  },
  {
    key: "audit.permissions.kpis",
    label: "KPIs",
    description: "Manage audit KPIs",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Create Audit KPIs";
        case "r":
          return "View Audit KPIs";
        case "u":
          return "Update Audit KPIs";
        case "d":
          return "Delete Audit KPIs";
        default:
          return `${PERMISSION_LABELS[action]} Audit KPIs`;
      }
    },
    path: "audit.kpis",
  },
  {
    key: "settings",
    label: "Settings",
    description: "Manage application settings",
    level: 0,
    path: "settings",
  },
  {
    key: "settings.permissions.roles",
    label: "Roles",
    description: "Manage roles and permissions",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Create Roles";
        case "r":
          return "View Roles";
        case "u":
          return "Update Roles";
        case "d":
          return "Delete Roles";
        default:
          return `${PERMISSION_LABELS[action]} Roles`;
      }
    },
    path: "settings.roles",
  },
  {
    key: "settings.permissions.fileType",
    label: "File Type",
    description: "Manage file types",
    level: 1,
    parentLabel: (action) => {
      switch (action) {
        case "c":
          return "Create File Types";
        case "r":
          return "View File Types";
        case "u":
          return "Update File Types";
        case "d":
          return "Delete File Types";
        default:
          return `${PERMISSION_LABELS[action]} File Types`;
      }
    },
    path: "settings.fileType",
  },
];

const PermissionsCheckboxGroup = ({
  permissions = {},
  onChange,
  readOnly = false,
}) => {
  const getPermissionValue = (path, action = "r") => {
    if (!permissions || !path) return false;

    const keys = (Array.isArray(path) ? path : path.split(".")).filter(
      (k) => k !== "permission" && k !== "permissions",
    );

    let current = permissions;

    for (let i = 0; i < keys.length; i++) {
      if (!current || typeof current !== "object") return false;
      // Only read from "permission" (singular), ignore "permissions" (plural)
      current = i === 0 ? current[keys[i]] : current.permission?.[keys[i]];
    }

    return current?.[action] === 1;
  };

  const handlePermissionChange = (path, action, checked) => {
    if (readOnly || !onChange) return;

    const keys = (Array.isArray(path) ? path : path.split(".")).filter(
      (k) => k !== "permission" && k !== "permissions",
    );

    const newPermissions = JSON.parse(JSON.stringify(permissions));
    let current = newPermissions;

    if (keys.length === 1) {
      current[keys[0]] ??= {};
      current[keys[0]][action] = checked ? 1 : 0;
      onChange(newPermissions);
      return;
    }

    current[keys[0]] ??= {};
    // Always remove "permissions" (plural) to prevent duplicates
    if (current[keys[0]].permissions) {
      // Merge data from "permissions" into "permission" if needed
      if (!current[keys[0]].permission) {
        current[keys[0]].permission = current[keys[0]].permissions;
      }
      delete current[keys[0]].permissions;
    }
    current[keys[0]].permission ??= {};
    current = current[keys[0]].permission;

    for (let i = 1; i < keys.length; i++) {
      current[keys[i]] ??= {};
      if (i === keys.length - 1) {
        current[keys[i]][action] = checked ? 1 : 0;
      } else {
        current = current[keys[i]];
      }
    }

    onChange(newPermissions);
  };

  return (
    <Box overflowX="auto" w="full">
      <Table
        variant="simple"
        size="sm"
        w="full"
        minW={{ base: "600px", md: "full" }}
      >
        <Hide below="md">
          <Thead>
            <Tr>
              <Th rowSpan={2}>Module</Th>
              <Th textAlign="center" colSpan={4} border="none">
                Permissions
              </Th>
            </Tr>
            <Tr>
              <Th textAlign="center">Create</Th>
              <Th textAlign="center">Read</Th>
              <Th textAlign="center">Update</Th>
              <Th textAlign="center">Delete</Th>
            </Tr>
          </Thead>
        </Hide>

        <Tbody>
          {MODULES.map((module) => (
            <Fragment key={module.key}>
              <Show below="md">
                <Tr>
                  <Td colSpan={5}>
                    <VStack align="stretch" spacing={0}>
                      <Text
                        fontWeight={module.level === 0 ? "semibold" : "normal"}
                        fontSize={{ base: "sm", md: "md" }}
                        pl={module.level * 6}
                      >
                        {module.label}
                      </Text>
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color="gray.600"
                        pl={module.level * 6}
                        opacity={0.6}
                        _hover={{ opacity: 1 }}
                      >
                        {module.description}
                      </Text>
                    </VStack>
                  </Td>
                </Tr>
              </Show>

              <Tr>
                <Hide below="md">
                  <Td>
                    <VStack align="stretch" spacing={0}>
                      <Text
                        fontWeight={module.level === 0 ? "semibold" : "normal"}
                        fontSize={{ base: "sm", md: "md" }}
                        pl={module.level * 6}
                      >
                        {module.label}
                      </Text>
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color="gray.600"
                        pl={module.level * 6}
                        opacity={0.6}
                        _hover={{ opacity: 1 }}
                      >
                        {module.description}
                      </Text>
                    </VStack>
                  </Td>
                </Hide>

                {["c", "r", "u", "d"].map((action) => {
                  const isActive = getPermissionValue(module.path, action);
                  return (
                    <Td
                      key={action}
                      textAlign="center"
                      w={{ base: "25%", md: "auto" }}
                      px={{ base: 1, md: 3 }}
                    >
                      <Tooltip
                        label={` ${
                          module.level > 0 && module.parentLabel
                            ? typeof module.parentLabel === "function"
                              ? module.parentLabel(action)
                              : `${module.parentLabel} ${module.label}`
                            : `${PERMISSION_LABELS[action]} ${module.label}`
                        }`}
                        placement="top"
                        hasArrow
                      >
                        <Button
                          size="sm"
                          borderRadius="full"
                          variant={isActive ? "solid" : "outline"}
                          colorScheme={isActive ? "brandPrimary" : "gray"}
                          onClick={() => {
                            if (!readOnly) {
                              handlePermissionChange(
                                module.path,
                                action,
                                !isActive,
                              );
                            }
                          }}
                          pointerEvents={readOnly ? "none" : "initial"}
                          minW="40px"
                          h="40px"
                          fontWeight="semibold"
                          fontSize="sm"
                          _hover={
                            !readOnly
                              ? {
                                  transform: "scale(1.05)",
                                  transition: "all 0.2s",
                                  colorScheme: isActive
                                    ? "gray"
                                    : "brandPrimary",
                                }
                              : {}
                          }
                        >
                          {action.toUpperCase()}
                        </Button>
                      </Tooltip>
                    </Td>
                  );
                })}
              </Tr>
            </Fragment>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default PermissionsCheckboxGroup;
