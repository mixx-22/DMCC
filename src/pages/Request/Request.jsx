import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Spinner,
  Center,
  Stack,
  Heading,
  Text,
  Button,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import DocumentDrawer from "../../components/Document/DocumentDrawer";
import QualityDocumentUploadModal from "../../components/Document/modals/QualityDocumentUploadModal";
import { ListView } from "../../components/Document/ListView";
import Pagination from "../../components/Pagination";
import apiService from "../../services/api";
import { useDocuments } from "../../context/_useContext";
import ResponsiveTabs, {
  ResponsiveTabList,
  ResponsiveTab,
  ResponsiveTabPanels,
  ResponsiveTabPanel,
} from "../../components/common/ResponsiveTabs";

const ITEMS_PER_PAGE = 10;

// Helper function to determine request status
const getRequestStatus = (request) => {
  const status = Number(request.status);
  const checkedOut = Number(request.metadata?.checkedOut);
  const mode = request.mode;

  // Discarded
  if (status === -1 && checkedOut === 1 && mode === "DISCARD") {
    return { label: "Discarded", colorScheme: "gray" };
  }

  // Published
  if (status === 2 && checkedOut === 1 && mode === "CONTROLLER") {
    return { label: "Published", colorScheme: "green" };
  }

  // Approved
  if (status === 1 && checkedOut === 1 && mode === "CONTROLLER") {
    return { label: "Approved", colorScheme: "blue" };
  }

  // Under Review
  if (status === 0 && checkedOut === 1 && mode === "TEAM") {
    return { label: "Under Review", colorScheme: "orange" };
  }

  // Pending - For Approval (Team mode)
  if (status === 0 && checkedOut === 0 && mode === "TEAM") {
    return { label: "Pending", colorScheme: "yellow" };
  }

  // Pending - My Requests (no mode or any mode with -1/1)
  if (status === -1 && checkedOut === 1 && !mode) {
    return { label: "Pending", colorScheme: "yellow" };
  }

  // Catch any -1/1 combination that doesn't have DISCARD mode
  if (status === -1 && checkedOut === 1) {
    return { label: "Pending", colorScheme: "yellow" };
  }

  return { label: "Unknown", colorScheme: "gray" };
};

const Request = () => {
  const { discardDocumentRequest } = useDocuments();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for each tab
  const [myRequests, setMyRequests] = useState([]);
  const [forApproval, setForApproval] = useState([]);
  const [forPublish, setForPublish] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize activeTab from URL query parameter
  const tabFromUrl = parseInt(searchParams.get("tab") || "0", 10);
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Pagination state for each tab
  const [myRequestsPage, setMyRequestsPage] = useState(1);
  const [forApprovalPage, setForApprovalPage] = useState(1);
  const [forPublishPage, setForPublishPage] = useState(1);
  const [requestHistoryPage, setRequestHistoryPage] = useState(1);

  // Total count for each tab
  const [myRequestsTotal, setMyRequestsTotal] = useState(0);
  const [forApprovalTotal, setForApprovalTotal] = useState(0);
  const [forPublishTotal, setForPublishTotal] = useState(0);
  const [requestHistoryTotal, setRequestHistoryTotal] = useState(0);

  const {
    isOpen: isQualityDocumentModalOpen,
    onOpen: onQualityDocumentModalOpen,
    onClose: onQualityDocumentModalClose,
  } = useDisclosure();

  // Transform request data helper function
  const transformRequestData = (requestData) => {
    return requestData.map((request) => {
      const statusInfo = getRequestStatus(request);
      return {
        ...request,
        type: "file",
        id: request?.documentData?.id || request?.documentData?._id,
        _id: request?.documentData?.id || request?.documentData?._id,
        requestStatus: statusInfo,
        requestedBy: request.requestedBy
          ? {
              _id: request.requestedBy._id,
              id: request.requestedBy._id,
              firstName: request.requestedBy.firstName,
              middleName: request.requestedBy.middleName,
              lastName: request.requestedBy.lastName,
              name: `${request.requestedBy.firstName} ${request.requestedBy.lastName}`.trim(),
              profilePicture: request.requestedBy.profilePicture,
            }
          : null,
        team: request.metadata?.teamData
          ? {
              name: request.metadata.teamData.name,
              id: request.metadata.teamData.id || request.metadata.teamData._id,
              _id:
                request.metadata.teamData._id || request.metadata.teamData.id,
            }
          : request.team || null,
        dateRequested: request.createdAt || request.dateRequested,
        metadata: {
          ...request.metadata,
          documentNumber:
            request.documentNumber || request.metadata?.documentNumber,
        },
        title: request.title || request.documentTitle,
      };
    });
  };

  // Fetch My Requests
  const fetchMyRequests = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        status: -1,
        "metadata.checkedOut": 1,
      };

      const response = await apiService.request("/request", {
        method: "GET",
        params,
      });

      if (response.success) {
        const transformedData = transformRequestData(response.data || []);
        setMyRequests(transformedData);
        setMyRequestsTotal(response.meta?.total || 0);
      } else {
        throw new Error(response.message || "Failed to fetch my requests");
      }
    } catch (error) {
      console.error("Failed to fetch my requests:", error);
      toast.error("Error", {
        description: "Failed to load my requests",
        duration: 3000,
      });
      setMyRequests([]);
      setMyRequestsTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch For Approval
  const fetchForApproval = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        status: 0,
        "metadata.checkedOut": 0,
        mode: "TEAM",
      };

      const response = await apiService.request("/request", {
        method: "GET",
        params,
      });

      if (response.success) {
        const transformedData = transformRequestData(response.data || []);
        setForApproval(transformedData);
        setForApprovalTotal(response.meta?.total || 0);
      } else {
        throw new Error(
          response.message || "Failed to fetch requests for approval",
        );
      }
    } catch (error) {
      console.error("Failed to fetch requests for approval:", error);
      toast.error("Error", {
        description: "Failed to load requests for approval",
        duration: 3000,
      });
      setForApproval([]);
      setForApprovalTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch For Publish
  const fetchForPublish = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        status: 1,
        "metadata.checkedOut": 0,
        mode: "CONTROLLER",
      };

      const response = await apiService.request("/request", {
        method: "GET",
        params,
      });

      if (response.success) {
        const transformedData = transformRequestData(response.data || []);
        setForPublish(transformedData);
        setForPublishTotal(response.meta?.total || 0);
      } else {
        throw new Error(
          response.message || "Failed to fetch requests for publish",
        );
      }
    } catch (error) {
      console.error("Failed to fetch requests for publish:", error);
      toast.error("Error", {
        description: "Failed to load requests for publish",
        duration: 3000,
      });
      setForPublish([]);
      setForPublishTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Request History
  const fetchRequestHistory = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        includeAll: true, // Fetch all statuses for history
      };

      const response = await apiService.request("/request", {
        method: "GET",
        params,
      });

      if (response.success) {
        const transformedData = transformRequestData(response.data || []);
        setRequestHistory(transformedData);
        setRequestHistoryTotal(response.meta?.total || 0);
      } else {
        throw new Error(response.message || "Failed to fetch request history");
      }
    } catch (error) {
      console.error("Failed to fetch request history:", error);
      toast.error("Error", {
        description: "Failed to load request history",
        duration: 3000,
      });
      setRequestHistory([]);
      setRequestHistoryTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync activeTab with URL parameter
  useEffect(() => {
    const tabFromUrl = parseInt(searchParams.get("tab") || "0", 10);
    if (tabFromUrl >= 0 && tabFromUrl <= 3 && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    switch (activeTab) {
      case 0:
        fetchMyRequests(myRequestsPage);
        break;
      case 1:
        fetchForApproval(forApprovalPage);
        break;
      case 2:
        fetchForPublish(forPublishPage);
        break;
      case 3:
        fetchRequestHistory(requestHistoryPage);
        break;
      default:
        break;
    }
  }, [
    activeTab,
    myRequestsPage,
    forApprovalPage,
    forPublishPage,
    requestHistoryPage,
    fetchMyRequests,
    fetchForApproval,
    fetchForPublish,
    fetchRequestHistory,
  ]);

  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
  };

  const handleDiscardRequest = async (doc) => {
    const result = await Swal.fire({
      title: "Discard Request?",
      text: "Are you sure you want to discard this request? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E53E3E",
      cancelButtonColor: "#718096",
      confirmButtonText: "Discard",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await discardDocumentRequest({
          ...doc,
          requestId: doc._id || doc.id,
          requestData: {
            requestId: doc._id || doc.id,
          },
        });

        toast.success("Request Discarded", {
          description: "The request has been discarded successfully",
          duration: 3000,
        });
        // Refresh the current tab
        switch (activeTab) {
          case 0:
            fetchMyRequests(myRequestsPage);
            break;
          case 1:
            fetchForApproval(forApprovalPage);
            break;
          case 2:
            fetchForPublish(forPublishPage);
            break;
          case 3:
            fetchRequestHistory(requestHistoryPage);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Failed to discard request:", error);
        toast.error("Error", {
          description: error?.message || "Failed to discard request",
          duration: 3000,
        });
      }
    }
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    setSearchParams({ tab: index.toString() });
    // Reset to page 1 when switching tabs
    switch (index) {
      case 0:
        setMyRequestsPage(1);
        break;
      case 1:
        setForApprovalPage(1);
        break;
      case 2:
        setForPublishPage(1);
        break;
      case 3:
        setRequestHistoryPage(1);
        break;
      default:
        break;
    }
  };

  // Handle modal close and refresh current tab
  const handleModalClose = () => {
    onQualityDocumentModalClose();
    // Refresh the current active tab (always fetch page 1 to see new request)
    switch (activeTab) {
      case 0:
        setMyRequestsPage(1);
        fetchMyRequests(1);
        break;
      case 1:
        setForApprovalPage(1);
        fetchForApproval(1);
        break;
      case 2:
        setForPublishPage(1);
        fetchForPublish(1);
        break;
      case 3:
        setRequestHistoryPage(1);
        fetchRequestHistory(1);
        break;
      default:
        break;
    }
  };

  // Render tab content helper
  const renderTabContent = (
    documents,
    totalCount,
    currentPage,
    onPageChange,
    emptyMessage,
    showDiscardButton = false,
    showStatus = false,
  ) => (
    <Stack spacing={{ base: 4, lg: 6 }}>
      {loading ? (
        <Center py={12}>
          <Spinner size="xl" color="brandPrimary.500" />
        </Center>
      ) : documents.length === 0 ? (
        <Center py={12}>
          <Text color="gray.500" fontSize="lg">
            {emptyMessage}
          </Text>
        </Center>
      ) : (
        <>
          <ListView
            documents={documents}
            selectedDocument={selectedDocument}
            onDocumentClick={handleDocumentClick}
            onDiscardRequest={
              showDiscardButton ? handleDiscardRequest : undefined
            }
            sourcePage={{ path: "/request", label: "Requests" }}
            isRequestView={true}
            showRequestStatus={showStatus}
          />
          {totalCount > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </Stack>
  );

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Requests</Heading>
      </PageHeader>

      <Stack spacing={{ base: 4, lg: 6 }}>
        <ResponsiveTabs
          index={activeTab}
          onChange={handleTabChange}
          colorScheme="warning"
        >
          <ResponsiveTabList>
            <ResponsiveTab>My Requests</ResponsiveTab>
            <ResponsiveTab>For Approval</ResponsiveTab>
            <ResponsiveTab>For Publish</ResponsiveTab>
            <ResponsiveTab>Request History</ResponsiveTab>
          </ResponsiveTabList>

          <ResponsiveTabPanels>
            <ResponsiveTabPanel px={0}>
              {renderTabContent(
                myRequests,
                myRequestsTotal,
                myRequestsPage,
                setMyRequestsPage,
                "No requests found",
                true, // Show discard button for My Requests
              )}
            </ResponsiveTabPanel>

            <ResponsiveTabPanel px={0}>
              {renderTabContent(
                forApproval,
                forApprovalTotal,
                forApprovalPage,
                setForApprovalPage,
                "No requests pending approval",
                false, // Hide discard button for For Approval
              )}
            </ResponsiveTabPanel>

            <ResponsiveTabPanel px={0}>
              {renderTabContent(
                forPublish,
                forPublishTotal,
                forPublishPage,
                setForPublishPage,
                "No requests pending publish",
                false, // Hide discard button for For Publish
              )}
            </ResponsiveTabPanel>

            <ResponsiveTabPanel px={0}>
              {renderTabContent(
                requestHistory,
                requestHistoryTotal,
                requestHistoryPage,
                setRequestHistoryPage,
                "No request history found",
                false, // Hide discard button for Request History
                true, // Show status column for Request History
              )}
            </ResponsiveTabPanel>
          </ResponsiveTabPanels>
        </ResponsiveTabs>
      </Stack>

      <DocumentDrawer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />

      <QualityDocumentUploadModal
        isOpen={isQualityDocumentModalOpen}
        onClose={handleModalClose}
        parentId={null}
        path={`/request`}
      />

      <PageFooter>
        <Flex justify="flex-end">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brandPrimary"
            onClick={onQualityDocumentModalOpen}
          >
            New Request
          </Button>
        </Flex>
      </PageFooter>
    </Box>
  );
};

export default Request;
