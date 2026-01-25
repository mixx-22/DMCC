import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Flex,
  Stack,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Spinner,
  Center,
  Text,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { FiGrid, FiList } from "react-icons/fi";
import { Select } from "chakra-react-select";
import { RangeDatepicker } from "chakra-dayzed-datepicker";
import PageHeader from "../components/PageHeader";
import UserAsyncSelect from "../components/UserAsyncSelect";
import { GridView } from "../components/Document/GridView";
import { ListView } from "../components/Document/ListView";
import DocumentDrawer from "../components/Document/DocumentDrawer";
import apiService from "../services/api";
import { useLayout } from "../context/_useContext";

const DOCUMENTS_ENDPOINT = "/documents";
const USE_API = import.meta.env.VITE_USE_API !== "false";
const DEBOUNCE_DELAY = 500; // 500ms debounce

// Date range options for the dropdown
const DATE_RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "thisYear", label: "This year" },
  { value: "lastYear", label: "Last year" },
  { value: "custom", label: "Custom range" },
];

// Helper function to get the label for a date range value
const getDateRangeLabel = (value) => {
  const option = DATE_RANGE_OPTIONS.find((opt) => opt.value === value);
  return option ? option.label : null;
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { viewMode, toggleViewMode } = useLayout();

  // Search filters
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [dateRange, setDateRange] = useState(
    searchParams.get("dateRange") || "",
  );
  const [selectedDates, setSelectedDates] = useState([
    searchParams.get("startDate")
      ? new Date(searchParams.get("startDate"))
      : null,
    searchParams.get("endDate") ? new Date(searchParams.get("endDate")) : null,
  ]);
  const [owners, setOwners] = useState([]);

  // Search results and loading state
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Double-click detection for navigation (same as Documents page)
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickId, setLastClickId] = useState(null);

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Load owners from query params when URL changes
  useEffect(() => {
    const ownersParam = searchParams.get("owners");
    if (ownersParam) {
      try {
        const ownersArray = JSON.parse(decodeURIComponent(ownersParam));
        setOwners(ownersArray);
      } catch (e) {
        console.error("Failed to parse owners from query params:", e);
      }
    } else {
      setOwners([]);
    }
  }, [searchParams]);

  // Update URL when filters change (without debounce)
  useEffect(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (type) params.type = type;
    if (dateRange) params.dateRange = dateRange;
    if (dateRange === "custom" && selectedDates[0] && selectedDates[1]) {
      params.startDate = selectedDates[0].toISOString().split("T")[0];
      params.endDate = selectedDates[1].toISOString().split("T")[0];
    }
    if (owners.length > 0) {
      params.owners = encodeURIComponent(JSON.stringify(owners));
    }
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, type, dateRange, selectedDates, owners]);

  // Perform search with API request
  const performSearch = useCallback(async () => {
    // Only search if we have a keyword (as per requirement)
    if (!keyword.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    if (!USE_API) {
      // Mock mode: use localStorage
      const saved = localStorage.getItem("documents");
      const allDocs = saved ? JSON.parse(saved) : [];

      // Apply client-side filtering in mock mode
      let filtered = [...allDocs];

      if (keyword.trim()) {
        const lowerKeyword = keyword.toLowerCase().trim();
        filtered = filtered.filter((doc) => {
          const title = (doc.title || "").toLowerCase();
          const description = (doc.description || "").toLowerCase();
          return (
            title.includes(lowerKeyword) || description.includes(lowerKeyword)
          );
        });
      }

      if (type) {
        filtered = filtered.filter((doc) => doc.type === type);
      }

      if (dateRange && dateRange !== "custom") {
        const now = new Date();
        let startDate = new Date();

        switch (dateRange) {
          case "today": {
            startDate.setHours(0, 0, 0, 0);
            break;
          }
          case "last7days": {
            startDate.setDate(now.getDate() - 7);
            break;
          }
          case "last30days": {
            startDate.setDate(now.getDate() - 30);
            break;
          }
          case "thisYear": {
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          }
          case "lastYear": {
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            const endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
            filtered = filtered.filter((doc) => {
              const docDate = new Date(doc.createdAt || doc.updatedAt);
              return docDate >= startDate && docDate <= endDate;
            });
            break;
          }
        }

        if (dateRange !== "lastYear") {
          filtered = filtered.filter((doc) => {
            const docDate = new Date(doc.createdAt || doc.updatedAt);
            return docDate >= startDate;
          });
        }
      } else if (
        dateRange === "custom" &&
        selectedDates[0] &&
        selectedDates[1]
      ) {
        const startOfDay = new Date(selectedDates[0]);
        const endOfDay = new Date(selectedDates[1]);
        endOfDay.setHours(23, 59, 59, 999);

        filtered = filtered.filter((doc) => {
          const docDate = new Date(doc.createdAt || doc.updatedAt);
          return docDate >= startOfDay && docDate <= endOfDay;
        });
      }

      if (owners.length > 0) {
        const ownerIds = owners.map((o) => o.id || o._id);
        filtered = filtered.filter((doc) => {
          const creatorId =
            doc.createdBy?.id || doc.createdBy?._id || doc.createdBy;
          return ownerIds.includes(creatorId);
        });
      }

      setSearchResults(filtered);
      setHasSearched(true);
      return;
    }

    // API mode: Make server request with filters
    setLoading(true);
    setHasSearched(true);

    try {
      const params = {};

      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      if (type) {
        params.type = type;
      }

      if (dateRange) {
        params.dateRange = dateRange;
        if (dateRange === "custom" && selectedDates[0] && selectedDates[1]) {
          params.startDate = selectedDates[0].toISOString().split("T")[0];
          params.endDate = selectedDates[1].toISOString().split("T")[0];
        }
      }

      if (owners.length > 0) {
        // Send owner IDs as comma-separated string
        params.owners = owners.map((o) => o.id || o._id).join(",");
      }

      const response = await apiService.request(DOCUMENTS_ENDPOINT, {
        method: "GET",
        params,
      });

      const { success = false, data = { documents: [] } } = response;

      if (success) {
        setSearchResults(data.documents || []);
      } else {
        console.error("Search failed:", response);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to search documents:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, type, dateRange, selectedDates, owners]);

  // Debounced search effect - only trigger when user is idle and has a keyword
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only debounce if we have a keyword
    if (keyword.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch();
      }, DEBOUNCE_DELAY);
    } else {
      // If no keyword, clear results immediately
      setSearchResults([]);
      setHasSearched(false);
    }

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, type, dateRange, selectedDates, owners]);

  // Handle document click with double-click detection (same as Documents page)
  const handleDocumentClick = (doc) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;

    if (lastClickId === doc.id && timeDiff < 300) {
      // Double click - navigate to document/folder
      if (doc.type === "folder" || doc.type === "auditSchedule") {
        navigate(`/documents/folders/${doc.id}`);
      } else if (doc.type === "file") {
        navigate(`/document/${doc.id}`, {
          state: { from: { path: "/search", label: "Search Results" } },
        });
      }
      setLastClickTime(0);
      setLastClickId(null);
    } else {
      // Single click - show in drawer
      setSelectedDocument(doc);
      setLastClickTime(now);
      setLastClickId(doc.id);
    }
  };

  return (
    <Box>
      <PageHeader>
        <Flex justify="space-between" align="center" w="full">
          <Heading variant="pageTitle" noOfLines={1}>
            Search {import.meta.env.VITE_PROJECT_NAME || "Auptilyze"}
          </Heading>
          <HStack>
            <IconButton
              icon={viewMode === "grid" ? <FiList /> : <FiGrid />}
              onClick={toggleViewMode}
              aria-label="Toggle view"
              variant="ghost"
            />
          </HStack>
        </Flex>
      </PageHeader>

      <Stack spacing={6}>
        {/* Search Filters Card */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={4}
              >
                {/* Keyword Input */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl>
                    <FormLabel>Keyword</FormLabel>
                    <Input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Search by title or description..."
                    />
                  </FormControl>
                </GridItem>

                {/* Type Filter */}
                <GridItem>
                  <FormControl>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={
                        type
                          ? {
                              value: type,
                              label:
                                type.charAt(0).toUpperCase() + type.slice(1),
                            }
                          : null
                      }
                      onChange={(option) => setType(option ? option.value : "")}
                      options={[
                        { value: "file", label: "File" },
                        { value: "folder", label: "Folder" },
                        { value: "auditSchedule", label: "Audit Schedule" },
                        { value: "formTemplate", label: "Form Template" },
                        { value: "formResponse", label: "Form Response" },
                        { value: "qualityDocument", label: "Quality Document" },
                      ]}
                      placeholder="All types"
                      isClearable
                      colorScheme="brandPrimary"
                      useBasicStyles
                    />
                  </FormControl>
                </GridItem>

                {/* Date Range Filter */}
                <GridItem>
                  <FormControl>
                    <FormLabel>Date Range</FormLabel>
                    <Select
                      value={
                        dateRange
                          ? {
                              value: dateRange,
                              label: getDateRangeLabel(dateRange),
                            }
                          : null
                      }
                      onChange={(option) =>
                        setDateRange(option ? option.value : "")
                      }
                      options={DATE_RANGE_OPTIONS}
                      placeholder="All dates"
                      isClearable
                      colorScheme="brandPrimary"
                      useBasicStyles
                    />
                  </FormControl>
                </GridItem>

                {/* Custom Date Range */}
                {dateRange === "custom" && (
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormControl>
                      <FormLabel>Select Date Range</FormLabel>
                      <RangeDatepicker
                        selectedDates={selectedDates}
                        onDateChange={setSelectedDates}
                        propsConfigs={{
                          inputProps: {
                            placeholder: "Select date range",
                          },
                        }}
                      />
                    </FormControl>
                  </GridItem>
                )}

                {/* Owners Filter */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <UserAsyncSelect
                    label="Owners"
                    placeholder="Search for document owners..."
                    value={owners}
                    onChange={setOwners}
                    limit={5}
                    displayMode="badges"
                  />
                </GridItem>
              </Grid>

              {/* Clear Filters Button */}
              <Flex justify="flex-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setKeyword("");
                    setType("");
                    setDateRange("");
                    setSelectedDates([null, null]);
                    setOwners([]);
                  }}
                >
                  Clear All Filters
                </Button>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Results Summary */}
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600">
            {hasSearched
              ? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} found`
              : "Enter a keyword to start searching"}
          </Text>
        </Flex>

        {/* Search Results */}
        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="brandPrimary.500" />
          </Center>
        ) : !hasSearched ? (
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="lg" color="gray.500">
                Enter a keyword to search
              </Text>
              <Text fontSize="sm" color="gray.400">
                Search will start automatically as you type
              </Text>
            </VStack>
          </Center>
        ) : searchResults.length === 0 ? (
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="lg" color="gray.500">
                No documents found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your search filters
              </Text>
            </VStack>
          </Center>
        ) : viewMode === "grid" ? (
          <GridView
            documents={searchResults}
            selectedDocument={selectedDocument}
            onDocumentClick={handleDocumentClick}
          />
        ) : (
          <ListView
            documents={searchResults}
            selectedDocument={selectedDocument}
            onDocumentClick={handleDocumentClick}
          />
        )}
      </Stack>

      <DocumentDrawer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </Box>
  );
};

export default Search;
