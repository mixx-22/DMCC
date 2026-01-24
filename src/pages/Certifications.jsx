import { useState } from "react";
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useDisclosure,
  HStack,
  Input,
  VStack,
  Text,
  IconButton,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { useApp } from "../context/_useContext";
import { useNavigate } from "react-router-dom";
import CertificationUploadModal from "../components/CertificationUploadModal";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import { differenceInCalendarDays } from "date-fns";
import Timestamp from "../components/Timestamp";

const Certifications = () => {
  const {
    certifications,
    deleteCertification,
    getExpiringCertifications,
    currentUser,
  } = useApp();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const tableBg = useColorModeValue("white", "gray.800");
  const tableHeadBg = useColorModeValue("gray.50", "gray.700");
  const warningBg = useColorModeValue("orange.50", "orange.900");
  const warningBorder = useColorModeValue("orange.200", "orange.600");
  const warningText = useColorModeValue("orange.800", "orange.200");
  const emptyStateColor = useColorModeValue("gray.500", "gray.400");
  const canViewCertification = (cert) => {
    if (currentUser?.userType === "Admin") {
      return true;
    }
    if (!cert.department) {
      return true;
    }
    return cert.department === currentUser?.department;
  };

  const visibleCertifications = certifications.filter(canViewCertification);
  const expiringCerts =
    getExpiringCertifications().filter(canViewCertification);

  const filteredCertifications = visibleCertifications.filter(
    (cert) =>
      cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuer?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  const getDaysRemaining = (expirationDate) => {
    if (!expirationDate) return null;
    const expDate = new Date(expirationDate);
    const diff = differenceInCalendarDays(expDate, new Date());
    return diff;
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this certification?")) {
      deleteCertification(id);
    }
  };

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Certifications & Permits</Heading>
      </PageHeader>
      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brandPrimary"
            onClick={onOpen}
          >
            Add Certification
          </Button>
        </Flex>
      </PageFooter>

      {expiringCerts.length > 0 && (
        <Box
          bg={warningBg}
          border="1px"
          borderColor={warningBorder}
          borderRadius="md"
          p={4}
          mb={6}
        >
          <Text fontWeight="semibold" color={warningText} mb={2}>
            ⚠️ {expiringCerts.length} certification(s) expiring within 2 months
          </Text>
        </Box>
      )}

      <Box mb={6}>
        <Input
          placeholder="Search certifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="400px"
          id="search"
          name="search"
        />
      </Box>

      <Box bg={tableBg} borderRadius="md" overflow="hidden">
        <Table variant="simple">
          <Thead bg={tableHeadBg}>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Issuer</Th>
              <Th>Expiration Date</Th>
              <Th>Days Remaining</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCertifications.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8}>
                  <VStack>
                    <Text color={emptyStateColor}>No certifications found</Text>
                    <Button
                      size="sm"
                      colorScheme="brandPrimary"
                      onClick={onOpen}
                    >
                      Add Your First Certification
                    </Button>
                  </VStack>
                </Td>
              </Tr>
            ) : (
              filteredCertifications.map((cert) => {
                const expStatus = getExpirationStatus(cert.expirationDate);
                const daysRemaining = getDaysRemaining(cert.expirationDate);
                return (
                  <Tr key={`cert-${cert.id}`}>
                    <Td fontWeight="semibold">{cert.name}</Td>
                    <Td>{cert.type || "N/A"}</Td>
                    <Td>{cert.issuer || "N/A"}</Td>
                    <Td>
                      <Timestamp date={cert.expirationDate} />
                    </Td>
                    <Td>
                      {daysRemaining === null
                        ? "N/A"
                        : daysRemaining < 0
                          ? "Expired"
                          : `${daysRemaining} day${
                              daysRemaining === 1 ? "" : "s"
                            }`}
                    </Td>
                    <Td>
                      <Badge colorScheme={expStatus.color}>
                        {expStatus.text}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<FiEye />}
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/certifications/${cert.id}`)}
                          aria-label="View"
                        />
                        <IconButton
                          icon={<FiEdit />}
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate(`/certifications/${cert.id}?edit=true`)
                          }
                          aria-label="Edit"
                        />
                        <IconButton
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(cert.id)}
                          aria-label="Delete"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Box>

      <CertificationUploadModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Certifications;
