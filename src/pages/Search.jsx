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
import { FiGrid, FiList, FiSearch } from "react-icons/fi";
import PageHeader from "../components/PageHeader";
import UserAsyncSelect from "../components/UserAsyncSelect";
import { GridView } from "../components/Document/GridView";
import { ListView } from "../components/Document/ListView";
import { useDocuments } from "../context/_useContext";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { documents: allDocuments, loading: documentsLoading } = useDocuments();

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

  // Search results
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Load owners from query params on mount
  useEffect(() => {
    const ownersParam = searchParams.get("owners");
    if (ownersParam) {
      try {
        const ownersArray = JSON.parse(decodeURIComponent(ownersParam));
        setOwners(ownersArray);
      } catch (e) {
        console.error("Failed to parse owners from query params:", e);
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Filter documents based on search criteria
  useEffect(() => {
    let filtered = [...allDocuments];

    // Filter by keyword
    if (keyword.trim()) {
      const lowerKeyword = keyword.toLowerCase().trim();
      filtered = filtered.filter((doc) => {
        const title = (doc.title || "").toLowerCase();
        const description = (doc.description || "").toLowerCase();
        return title.includes(lowerKeyword) || description.includes(lowerKeyword);
      });
    }

    // Filter by type
    if (type) {
      filtered = filtered.filter((doc) => doc.type === type);
    }

    // Filter by date range
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

    // Filter by owners
    if (owners.length > 0) {
      const ownerIds = owners.map((o) => o.id || o._id);
      filtered = filtered.filter((doc) => {
        const creatorId = doc.createdBy?.id || doc.createdBy?._id || doc.createdBy;
        return ownerIds.includes(creatorId);
      });
    }

    setFilteredDocuments(filtered);
  }, [allDocuments, keyword, type, dateRange, customStartDate, customEndDate, owners]);

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

  const handleSearch = () => {
    // Trigger re-filter by updating a dummy state or just let useEffect handle it
    // The useEffect dependencies will trigger the filter
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
                    <HStack>
                      <Input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Search by title or description..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSearch();
                        }}
                      />
                      <Button
                        leftIcon={<FiSearch />}
                        colorScheme="brandPrimary"
                        onClick={handleSearch}
                      >
                        Search
                      </Button>
                    </HStack>
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
            {filteredDocuments.length} result{filteredDocuments.length !== 1 ? "s" : ""}{" "}
            found
          </Text>
        </Flex>

        {/* Search Results */}
        {documentsLoading ? (
          <Center py={12}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : filteredDocuments.length === 0 ? (
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
            documents={filteredDocuments}
            selectedDocument={selectedDocument}
            onDocumentClick={handleDocumentClick}
          />
        ) : (
          <ListView
            documents={filteredDocuments}
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
