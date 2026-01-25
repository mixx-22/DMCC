import { useEffect } from "react";
import { FileTypesContext } from "./_contexts";
import { createCRUDProvider } from "./factories/createCRUDContext";
import { useFileTypes } from "./_useContext";

const FILE_TYPES_ENDPOINT = "/file-types";

// Example mock data for local development
const MOCK_FILE_TYPES = [
  {
    id: "1",
    name: "Quality Manual",
    isQualityDocument: true,
    requiresApproval: true,
    trackVersioning: true,
    isDefault: false,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: "2",
    name: "Work Instruction",
    isQualityDocument: true,
    requiresApproval: true,
    trackVersioning: true,
    isDefault: false,
    createdAt: "2024-02-10T14:30:00.000Z",
    updatedAt: "2024-03-05T09:15:00.000Z",
  },
  {
    id: "3",
    name: "Form",
    isQualityDocument: false,
    requiresApproval: false,
    trackVersioning: false,
    isDefault: false,
    createdAt: "2024-01-20T08:00:00.000Z",
    updatedAt: "2024-01-20T08:00:00.000Z",
  },
  {
    id: "4",
    name: "Policy",
    isQualityDocument: true,
    requiresApproval: true,
    trackVersioning: true,
    isDefault: false,
    createdAt: "2024-03-01T11:20:00.000Z",
    updatedAt: "2024-03-01T11:20:00.000Z",
  },
];

// Filter function for search
const filterFileTypes = (fileTypes, searchTerm) => {
  const searchLower = searchTerm.toLowerCase();
  return fileTypes.filter((fileType) => {
    return fileType.name.toLowerCase().includes(searchLower);
  });
};

// Create the provider using the factory
const BaseFileTypesProvider = createCRUDProvider({
  Context: FileTypesContext,
  resourceName: "fileTypes",
  resourceKey: "fileTypes",
  endpoint: FILE_TYPES_ENDPOINT,
  mockData: MOCK_FILE_TYPES,
  filterMockData: filterFileTypes,
});

// Wrapper to add initial fetch on mount
export const FileTypesProvider = ({ children }) => {
  return (
    <BaseFileTypesProvider>
      <InitialFetch>{children}</InitialFetch>
    </BaseFileTypesProvider>
  );
};

// Component to handle initial data fetch
function InitialFetch({ children }) {
  const { fetchFileTypes } = useFileTypes();

  useEffect(() => {
    fetchFileTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}
