import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Grid,
  useDisclosure,
} from "@chakra-ui/react";
import { FiArrowLeft, FiEdit, FiDownload, FiTrash2 } from "react-icons/fi";
import CertificationUploadModal from "../components/CertificationUploadModal";
import Timestamp from "../components/Timestamp";
import { useApp } from "../context/_useContext";

const CertificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    certifications,
    deleteCertification,
    addRecentDocument,
    currentUser,
  } = useApp();

  const certification = certifications.find((c) => c.id === id);

  useEffect(() => {
    if (isEdit && certification) {
      onOpen();
    }
  }, [isEdit, certification, onOpen]);

  useEffect(() => {
    if (certification) {
      addRecentDocument(certification.id, certification.name, "certifications");
    }
  }, [id, certification, addRecentDocument]);

  const canViewCertification = () => {
    if (!certification) return false;
    if (currentUser?.userType === "Admin") {
      return true;
    }
    if (!certification.department) {
      return true;
    }
    return certification.department === currentUser?.department;
  };

  if (!certification || !canViewCertification()) {
    return (
      <Box>
        <Text>
          {certification
            ? "You do not have permission to view this certification."
            : "Certification not found"}
        </Text>
        <Button onClick={() => navigate("/certifications")}>
          Back to Certifications
        </Button>
      </Box>
    );
  }

  const getExpirationStatus = (expirationDate) => {
    if (!expirationDate)
      return { status: "unknown", color: "gray", text: "No expiration date" };

    const expDate = new Date(expirationDate);
    const now = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    if (expDate < now) {
      return { status: "expired", color: "red", text: "Expired" };
    } else if (expDate <= twoMonthsFromNow) {
      return { status: "expiring", color: "orange", text: "Expiring Soon" };
    } else {
      return { status: "valid", color: "green", text: "Valid" };
    }
  };

  const expStatus = getExpirationStatus(certification.expirationDate);

  const handleDownload = () => {
    if (certification.file) {
      const link = window.document.createElement("a");
      link.href = certification.file;
      link.download = certification.fileName || "certification";
      link.click();
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this certification?")) {
      deleteCertification(certification.id);
      navigate("/certifications");
    }
  };

  const daysUntilExpiration = certification.expirationDate
    ? Math.ceil(
        (new Date(certification.expirationDate) - new Date()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <Box>
      <HStack mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          onClick={() => navigate("/certifications")}
          aria-label="Back"
        />
        <Heading flex={1}>{certification.name}</Heading>
        <HStack>
          <IconButton icon={<FiEdit />} onClick={onOpen} aria-label="Edit" />
          <IconButton
            icon={<FiDownload />}
            onClick={handleDownload}
            aria-label="Download"
            isDisabled={!certification.file}
          />
          <IconButton
            icon={<FiTrash2 />}
            colorScheme="red"
            onClick={handleDelete}
            aria-label="Delete"
          />
        </HStack>
      </HStack>

      <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={6}>
        <Card>
          <CardHeader>
            <Heading size="sm">Certification Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Status
                </Text>
                <Badge colorScheme={expStatus.color} mt={1}>
                  {expStatus.text}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Type
                </Text>
                <Text fontWeight="semibold">{certification.type || "N/A"}</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Issuer
                </Text>
                <Text fontWeight="semibold">
                  {certification.issuer || "N/A"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Created
                </Text>
                <Timestamp date={certification.createdAt} />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="sm">Expiration Details</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {certification.expirationDate ? (
                <>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Expiration Date
                    </Text>
                    <Text fontWeight="semibold">
                      <Timestamp date={certification.expirationDate} />
                    </Text>
                  </Box>
                  {daysUntilExpiration !== null && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">
                        Days Remaining
                      </Text>
                      <Text
                        fontWeight="semibold"
                        color={
                          daysUntilExpiration < 0
                            ? "red.500"
                            : daysUntilExpiration < 60
                              ? "orange.500"
                              : "green.500"
                        }
                      >
                        {daysUntilExpiration < 0
                          ? `Expired ${Math.abs(daysUntilExpiration)} days ago`
                          : `${daysUntilExpiration} days`}
                      </Text>
                    </Box>
                  )}
                </>
              ) : (
                <Text color="gray.500">No expiration date set</Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="sm">Description</Heading>
          </CardHeader>
          <CardBody>
            <Text>
              {certification.description || "No description provided"}
            </Text>
          </CardBody>
        </Card>
      </Grid>

      {certification.file && (
        <Card>
          <CardHeader>
            <Heading size="md">Scanned Document</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="semibold">{certification.fileName}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {certification.fileSize
                      ? `${(certification.fileSize / 1024).toFixed(2)} KB`
                      : "Size unknown"}
                  </Text>
                </VStack>
                <Button leftIcon={<FiDownload />} onClick={handleDownload}>
                  Download
                </Button>
              </HStack>
              {certification.file.startsWith("blob:") && (
                <Box
                  as="iframe"
                  src={certification.file}
                  w="100%"
                  h="600px"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                />
              )}
            </VStack>
          </CardBody>
        </Card>
      )}

      <CertificationUploadModal
        isOpen={isOpen}
        onClose={onClose}
        certification={certification}
      />
    </Box>
  );
};

export default CertificationDetail;
