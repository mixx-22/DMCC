import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useState } from "react";
import StandardsAsyncSelect from "../components/StandardsAsyncSelect";
import PreviousAuditAsyncSelect from "../components/PreviousAuditAsyncSelect";

const AuditScheduleFieldsDemo = () => {
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedPreviousAudit, setSelectedPreviousAudit] = useState(null);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Audit Schedule Fields Demo
          </Heading>
          <Text color="gray.600">
            This demo showcases the new StandardsAsyncSelect and
            PreviousAuditAsyncSelect components used in audit schedule creation.
          </Text>
        </Box>

        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" mb={4}>
                  1. Standards Selection
                </Heading>
                <StandardsAsyncSelect
                  value={selectedStandard}
                  onChange={(standard) => {
                    console.log("Selected standard:", standard);
                    setSelectedStandard(standard);
                  }}
                  label="Standard"
                />
                {selectedStandard && (
                  <Box mt={4} p={4} bg="blue.50" borderRadius="md">
                    <Text fontWeight="bold" mb={2}>
                      Selected Standard:
                    </Text>
                    <Text>Name: {selectedStandard.standard}</Text>
                    <Text>ID: {selectedStandard.id}</Text>
                    {selectedStandard.description && (
                      <Text>Description: {selectedStandard.description}</Text>
                    )}
                  </Box>
                )}
              </Box>

              <Box>
                <Heading size="md" mb={4}>
                  2. Previous Audit Selection
                </Heading>
                <PreviousAuditAsyncSelect
                  value={selectedPreviousAudit}
                  onChange={(audit) => {
                    console.log("Selected previous audit:", audit);
                    setSelectedPreviousAudit(audit);
                  }}
                  label="Previous Audit"
                />
                {selectedPreviousAudit && (
                  <Box mt={4} p={4} bg="green.50" borderRadius="md">
                    <Text fontWeight="bold" mb={2}>
                      Selected Previous Audit:
                    </Text>
                    <Text>Title: {selectedPreviousAudit.title}</Text>
                    <Text>Code: {selectedPreviousAudit.auditCode}</Text>
                    <Text>Type: {selectedPreviousAudit.auditType}</Text>
                  </Box>
                )}
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="blue.50">
          <CardBody>
            <Heading size="sm" mb={3} color="blue.700">
              What Changed?
            </Heading>
            <VStack align="stretch" spacing={2}>
              <Text fontSize="sm">
                ✅ <strong>Standard field</strong> is now a searchable dropdown
                that fetches from GET /standards API endpoint
              </Text>
              <Text fontSize="sm">
                ✅ <strong>Previous Audit field</strong> has been added to the
                audit schedule creation form (optional)
              </Text>
              <Text fontSize="sm">
                ✅ Both fields support async search with debouncing for better
                UX
              </Text>
              <Text fontSize="sm">
                ✅ Type at least 2 characters to search for standards or
                previous audits
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default AuditScheduleFieldsDemo;
