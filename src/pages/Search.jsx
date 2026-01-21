import { useState, useEffect } from "react";
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
  Select,
  Spinner,
  Center,
  Text,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { FiGrid, FiList } from "react-icons/fi";
import PageHeader from "../components/PageHeader";
import UserAsyncSelect from "../components/UserAsyncSelect";
import { GridView } from "../components/Document/GridView";
import { ListView } from "../components/Document/ListView";
import apiService from "../services/api";

const DOCUMENTS_ENDPOINT = "/documents";
const USE_API = import.meta.env.VITE_USE_API !== "false";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // View mode
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("searchViewMode");
    return saved || "grid";
  });

  // Search filters
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [dateRange, setDateRange] = useState(
    searchParams.get("dateRange") || ""
  );
  const [customStartDate, setCustomStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [customEndDate, setCustomEndDate] = useState(
    searchParams.get("endDate") || ""
  );
  const [owners, setOwners] = useState([]);

  // Search results and loading state
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

  // Persist view mode
  useEffect(() => {
    localStorage.setItem("searchViewMode", viewMode);
  }, [viewMode]);

  // Update URL when filters change
  useEffect(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (type) params.type = type;
    if (dateRange) params.dateRange = dateRange;
    if (dateRange === "custom") {
      if (customStartDate) params.startDate = customStartDate;
      if (customEndDate) params.endDate = customEndDate;
    }
    if (owners.length > 0) {
      params.owners = encodeURIComponent(JSON.stringify(owners));
    }
    setSearchParams(params, { replace: true });
    // We want this to run when filters change, not when setSearchParams changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, type, dateRange, customStartDate, customEndDate, owners]);

  // Perform search with API request
  const performSearch = async () => {
    // Check if we have any filters applied
    const hasFilters = keyword.trim() || type || dateRange || owners.length > 0;
    
    if (!hasFilters) {
      // Don't load all documents when filters are cleared
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
          return title.includes(lowerKeyword) || description.includes(lowerKeyword);
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
      } else if (dateRange === "custom" && (customStartDate || customEndDate)) {
        filtered = filtered.filter((doc) => {
          const docDate = new Date(doc.createdAt || doc.updatedAt);
          if (customStartDate && customEndDate) {
            return (
              docDate >= new Date(customStartDate) &&
              docDate <= new Date(customEndDate + "T23:59:59")
            );
          } else if (customStartDate) {
            return docDate >= new Date(customStartDate);
          } else if (customEndDate) {
            return docDate <= new Date(customEndDate + "T23:59:59");
          }
          return true;
        });
      }
      
      if (owners.length > 0) {
        const ownerIds = owners.map((o) => o.id || o._id);
        filtered = filtered.filter((doc) => {
          const creatorId = doc.createdBy?.id || doc.createdBy?._id || doc.createdBy;
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
        if (dateRange === "custom") {
          if (customStartDate) params.startDate = customStartDate;
          if (customEndDate) params.endDate = customEndDate;
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
  };

  // Trigger search when filters change
  useEffect(() => {
    performSearch();
    // We want this to run when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, type, dateRange, customStartDate, customEndDate, owners]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  const handleDocumentClick = (doc) => {
    if (doc.type === "folder" || doc.type === "auditSchedule") {
      navigate(`/documents/folders/${doc.id}`);
    } else if (doc.type === "file") {
      navigate(`/document/${doc.id}`);
    }
  };

  return (
    <Box>
      <PageHeader>
        <Flex justify="space-between" align="center" w="full">
          <Heading variant="pageTitle" noOfLines={1}>
            Search
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
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="All types"
                    >
                      <option value="file">File</option>
                      <option value="folder">Folder</option>
                      <option value="auditSchedule">Audit Schedule</option>
                      <option value="formTemplate">Form Template</option>
                      <option value="formResponse">Form Response</option>
                    </Select>
                  </FormControl>
                </GridItem>

                {/* Date Range Filter */}
                <GridItem>
                  <FormControl>
                    <FormLabel>Date Range</FormLabel>
                    <Select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      placeholder="All dates"
                    >
                      <option value="today">Today</option>
                      <option value="last7days">Last 7 days</option>
                      <option value="last30days">Last 30 days</option>
                      <option value="thisYear">This year</option>
                      <option value="lastYear">Last year</option>
                      <option value="custom">Custom range</option>
                    </Select>
                  </FormControl>
                </GridItem>

                {/* Custom Date Range */}
                {dateRange === "custom" && (
                  <>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Start Date</FormLabel>
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>End Date</FormLabel>
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                      </FormControl>
                    </GridItem>
                  </>
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
                    setCustomStartDate("");
                    setCustomEndDate("");
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
              : "Enter search criteria to find documents"}
          </Text>
        </Flex>

        {/* Search Results */}
        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : !hasSearched ? (
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="lg" color="gray.500">
                Start by entering search criteria
              </Text>
              <Text fontSize="sm" color="gray.400">
                Use the filters above to search for documents
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
            onMoreOptions={setSelectedDocument}
          />
        )}
      </Stack>
    </Box>
  );
};

export default Search;
