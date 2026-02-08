import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  Text,
  VStack,
  Code,
  useDisclosure,
} from "@chakra-ui/react";
import ClauseSelectionModal from "../components/ClauseSelectionModal";

// Sample data from the problem statement
const SAMPLE_CLAUSES = [
  {
    id: "003073c2-e848-4725-983c-553283d77460",
    clause: "4",
    title: "Context of the Organization",
    subClauses: [
      {
        id: "97124ee1-8267-45c7-b381-6e2e39080357",
        clause: "4.1",
        description: "Context of the ITSMS.",
      },
      {
        id: "1fc0e589-89a3-4248-a94f-7e21a218358a",
        clause: "4.2",
        description: "Interested parties.",
      },
      {
        id: "8a6a88af-02f0-4b06-a40f-0b55a4ffa17c",
        clause: "4.3",
        description: "Scope of the ITSMS.",
      },
      {
        id: "b8e835b1-77ca-48ed-a0de-667645ae4d97",
        clause: "4.4",
        description: "Service management system.",
      },
    ],
  },
  {
    id: "a8060b89-6c41-4ab6-bdff-dcdb2d4a59eb",
    clause: "5",
    title: "Leadership",
    subClauses: [
      {
        id: "4dcdc959-023f-4930-ab08-15ac49f5ddb1",
        clause: "5.1",
        description: "Leadership and commitment.",
      },
      {
        id: "7f3f5c1e-5240-41bd-90ba-0126d9af5b80",
        clause: "5.2",
        description: "Service management policy.",
      },
      {
        id: "84887b66-0e22-4a9d-8bb3-a81de9d37f34",
        clause: "5.3",
        description: "Roles and responsibilities.",
      },
    ],
  },
  {
    id: "84862eb4-92e1-44c5-9a65-37d5dfb48012",
    clause: "6",
    title: "Planning",
    subClauses: [
      {
        id: "f0782c18-9d9f-4e7f-ba24-e284ff19c6e3",
        clause: "6.1",
        description: "Risks and opportunities.",
      },
      {
        id: "9e0f7878-00c6-46c5-a938-063c9477cc5b",
        clause: "6.2",
        description: "Service management objectives.",
      },
    ],
  },
  {
    id: "20808972-d3b2-4539-8d77-14b08919e5df",
    clause: "7",
    title: "Support",
    subClauses: [
      {
        id: "b48fc49e-519e-451e-a681-6bcc20f034d4",
        clause: "7.1",
        description: "Resources.",
      },
      {
        id: "69b0ca89-ab5a-4e14-a03d-b03471668feb",
        clause: "7.2",
        description: "Competence.",
      },
      {
        id: "6ab7935c-387e-4f97-a03d-c407c7ca6f37",
        clause: "7.3",
        description: "Awareness.",
      },
      {
        id: "5e1c70ef-a8f6-4c7b-80b5-a55adda31ea6",
        clause: "7.4",
        description: "Communication.",
      },
      {
        id: "f501418a-84ec-4972-8728-d0667e954971",
        clause: "7.5",
        description: "Documented information.",
      },
    ],
  },
  {
    id: "89cf6146-2385-4273-8bf3-d2ef73407598",
    clause: "8",
    title: "Operation",
    subClauses: [
      {
        id: "09577f7b-91be-4153-b982-0d863122be80",
        clause: "8.1",
        description: "Service portfolio management.",
      },
      {
        id: "7d27a6be-e811-41d7-9b36-a9440f3f3cd1",
        clause: "8.2",
        description: "Service level management.",
      },
      {
        id: "7ac4cc0f-499e-4ee7-aa7f-2ab215d4f0d2",
        clause: "8.3",
        description: "Incident and request management.",
      },
      {
        id: "049be948-ccdf-4374-88c9-08fa8e059eb6",
        clause: "8.4",
        description: "Change management.",
      },
      {
        id: "c4268592-d7c6-4078-a8e7-7c0a08b5fb4c",
        clause: "8.5",
        description: "Configuration management.",
      },
    ],
  },
  {
    id: "9dd36a4f-f7aa-4c63-b3ae-f2572d3304d9",
    clause: "9",
    title: "Performance Evaluation",
    subClauses: [
      {
        id: "e3965044-cd59-43d5-a550-44181faa874f",
        clause: "9.1",
        description: "Monitoring and measurement.",
      },
      {
        id: "68ac1307-2493-42ba-8ab2-f4e93a6bc8c0",
        clause: "9.2",
        description: "Internal audit.",
      },
      {
        id: "c381e4db-7c0b-427d-8330-462a2e5e4226",
        clause: "9.3",
        description: "Management review.",
      },
    ],
  },
  {
    id: "66be6e11-34eb-4554-8889-623e942b27d1",
    clause: "10",
    title: "Improvement",
    subClauses: [
      {
        id: "46b5d4a8-a9ba-4dae-95b7-896ddac43a01",
        clause: "10.1",
        description: "Nonconformity and corrective action.",
      },
      {
        id: "2f71bf7d-8a5b-491c-844c-b350d39083e1",
        clause: "10.2",
        description: "Continual improvement.",
      },
    ],
  },
  {
    id: "test-deep-nesting",
    clause: "11",
    title: "Deep Nesting Example (for testing indentation)",
    subClauses: [
      {
        id: "test-11-1",
        clause: "11.1",
        description: "Level 2 clause - standard indentation.",
      },
      {
        id: "test-11-1-1",
        clause: "11.1.1",
        description: "Level 3 clause - deeper indentation.",
      },
      {
        id: "test-11-1-1-1",
        clause: "11.1.1.1",
        description: "Level 4 clause - even deeper indentation.",
      },
      {
        id: "test-11-1-1-1-1",
        clause: "11.1.1.1.1",
        description: "Level 5 clause - maximum depth example.",
      },
      {
        id: "test-11-2",
        clause: "11.2",
        description: "Another level 2 clause for comparison.",
      },
    ],
  },
];

const ClauseSelectionDemo = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedClauses, setSelectedClauses] = useState([]);

  const handleChange = (clauses) => {
    setSelectedClauses(clauses);
    console.log("Selected clauses:", clauses);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Clause Selection Modal Demo
          </Heading>
          <Text color="gray.600">
            This demo showcases the ClauseSelectionModal component with
            hierarchical checkbox selection, indeterminate states, collapsible
            parent clauses, and real-time selection display. Now behaves like a
            controlled input component.
          </Text>
        </Box>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Button colorScheme="blue" onClick={onOpen} size="lg">
                Open Clause Selection Modal
              </Button>

              {selectedClauses.length > 0 && (
                <Box>
                  <Heading size="sm" mb={3}>
                    Selected Clauses ({selectedClauses.length}):
                  </Heading>
                  <Code
                    display="block"
                    whiteSpace="pre"
                    p={4}
                    borderRadius="md"
                    fontSize="sm"
                  >
                    {JSON.stringify(selectedClauses, null, 2)}
                  </Code>
                </Box>
              )}

              {selectedClauses.length === 0 && (
                <Text color="gray.500" fontStyle="italic">
                  No clauses selected yet. Click the button above to select
                  clauses.
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Heading size="sm">Features:</Heading>
              <Text fontSize="sm">✓ Hierarchical checkbox tree structure</Text>
              <Text fontSize="sm">
                ✓ Parent clauses show indeterminate state when partially
                selected
              </Text>
              <Text fontSize="sm">✓ Collapsible parent clauses</Text>
              <Text fontSize="sm">
                ✓ Behaves like a controlled input with value and onChange
              </Text>
              <Text fontSize="sm">
                ✓ Real-time selected clauses display in side panel
              </Text>
              <Text fontSize="sm">
                ✓ Progressive indentation based on clause depth
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      <ClauseSelectionModal
        isOpen={isOpen}
        onClose={onClose}
        clauses={SAMPLE_CLAUSES}
        value={selectedClauses}
        onChange={handleChange}
      />
    </Container>
  );
};

export default ClauseSelectionDemo;
