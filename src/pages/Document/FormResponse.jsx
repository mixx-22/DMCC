import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Spinner,
  Center,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Stack,
  FormErrorMessage,
  Divider,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiSend, FiArrowLeft } from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import Breadcrumbs from "../../components/Document/Breadcrumbs";
import { useDocuments } from "../../context/_useContext";
import { toast } from "sonner";
import api from "../../services/api";

const FormResponse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchDocumentById } = useDocuments();

  const [formTemplate, setFormTemplate] = useState(null);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const contentBg = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const loadFormTemplate = async () => {
      setIsLoading(true);
      try {
        const doc = await fetchDocumentById(id);
        if (doc && doc.type === "formTemplate") {
          setFormTemplate(doc);
          // Initialize responses object
          const initialResponses = {};
          doc.metadata?.questions?.forEach((question) => {
            initialResponses[question.id] =
              question.type === "checkbox" ? [] : "";
          });
          setResponses(initialResponses);
        } else {
          toast.error("Invalid Form", {
            description: "This is not a valid form template",
            duration: 3000,
          });
          navigate("/documents");
        }
      } catch (error) {
        console.error("Error fetching form template:", error);
        toast.error("Error", {
          description: "Failed to load form template",
          duration: 3000,
        });
        navigate("/documents");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadFormTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleInputChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Clear error for this field
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    formTemplate.metadata?.questions?.forEach((question) => {
      if (question.required) {
        const response = responses[question.id];
        if (
          !response ||
          (Array.isArray(response) && response.length === 0) ||
          (typeof response === "string" && response.trim() === "")
        ) {
          newErrors[question.id] = "This field is required";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit form responses to the backend
      await api.post("/form-responses", {
        formTemplateId: id,
        responses: responses,
      });

      toast.success("Success", {
        description: "Form response submitted successfully",
        duration: 3000,
      });
      navigate(`/documents/${id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Submission Failed", {
        description:
          error.response?.data?.message || "Failed to submit form response",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    const hasError = !!errors[question.id];

    switch (question.type) {
      case "text":
        return (
          <FormControl
            key={question.id}
            isRequired={question.required}
            isInvalid={hasError}
          >
            <FormLabel>
              {index + 1}. {question.label}
              {question.required && (
                <Badge ml={2} colorScheme="red" fontSize="xs">
                  Required
                </Badge>
              )}
            </FormLabel>
            <Input
              value={responses[question.id] || ""}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder="Enter your answer"
            />
            {hasError && (
              <FormErrorMessage>{errors[question.id]}</FormErrorMessage>
            )}
          </FormControl>
        );

      case "textarea":
        return (
          <FormControl
            key={question.id}
            isRequired={question.required}
            isInvalid={hasError}
          >
            <FormLabel>
              {index + 1}. {question.label}
              {question.required && (
                <Badge ml={2} colorScheme="red" fontSize="xs">
                  Required
                </Badge>
              )}
            </FormLabel>
            <Textarea
              value={responses[question.id] || ""}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder="Enter your answer"
              rows={4}
            />
            {hasError && (
              <FormErrorMessage>{errors[question.id]}</FormErrorMessage>
            )}
          </FormControl>
        );

      case "number":
        return (
          <FormControl
            key={question.id}
            isRequired={question.required}
            isInvalid={hasError}
          >
            <FormLabel>
              {index + 1}. {question.label}
              {question.required && (
                <Badge ml={2} colorScheme="red" fontSize="xs">
                  Required
                </Badge>
              )}
            </FormLabel>
            <Input
              type="number"
              value={responses[question.id] || ""}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder="Enter a number"
            />
            {hasError && (
              <FormErrorMessage>{errors[question.id]}</FormErrorMessage>
            )}
          </FormControl>
        );

      case "email":
        return (
          <FormControl
            key={question.id}
            isRequired={question.required}
            isInvalid={hasError}
          >
            <FormLabel>
              {index + 1}. {question.label}
              {question.required && (
                <Badge ml={2} colorScheme="red" fontSize="xs">
                  Required
                </Badge>
              )}
            </FormLabel>
            <Input
              type="email"
              value={responses[question.id] || ""}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder="Enter email address"
            />
            {hasError && (
              <FormErrorMessage>{errors[question.id]}</FormErrorMessage>
            )}
          </FormControl>
        );

      case "date":
        return (
          <FormControl
            key={question.id}
            isRequired={question.required}
            isInvalid={hasError}
          >
            <FormLabel>
              {index + 1}. {question.label}
              {question.required && (
                <Badge ml={2} colorScheme="red" fontSize="xs">
                  Required
                </Badge>
              )}
            </FormLabel>
            <Input
              type="date"
              value={responses[question.id] || ""}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
            />
            {hasError && (
              <FormErrorMessage>{errors[question.id]}</FormErrorMessage>
            )}
          </FormControl>
        );

      case "select":
      case "dropdown":
        return (
          <FormControl
            key={question.id}
            isRequired={question.required}
            isInvalid={hasError}
          >
            <FormLabel>
              {index + 1}. {question.label}
              {question.required && (
                <Badge ml={2} colorScheme="red" fontSize="xs">
                  Required
                </Badge>
              )}
            </FormLabel>
            <Select
              value={responses[question.id] || ""}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder="Select an option"
            >
              {question.options?.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            {hasError && (
              <FormErrorMessage>{errors[question.id]}</FormErrorMessage>
            )}
          </FormControl>
        );

      case "radio":
        return (
          <FormControl
            key={question.id}
            isRequired={question.required}
            isInvalid={hasError}
          >
            <FormLabel>
              {index + 1}. {question.label}
              {question.required && (
                <Badge ml={2} colorScheme="red" fontSize="xs">
                  Required
                </Badge>
              )}
            </FormLabel>
            <RadioGroup
              value={responses[question.id] || ""}
              onChange={(value) => handleInputChange(question.id, value)}
            >
              <Stack spacing={2}>
                {question.options?.map((option, idx) => (
                  <Radio key={idx} value={option}>
                    {option}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
            {hasError && (
              <FormErrorMessage>{errors[question.id]}</FormErrorMessage>
            )}
          </FormControl>
        );

      case "checkbox":
        return (
          <FormControl
            key={question.id}
            isRequired={question.required}
            isInvalid={hasError}
          >
            <FormLabel>
              {index + 1}. {question.label}
              {question.required && (
                <Badge ml={2} colorScheme="red" fontSize="xs">
                  Required
                </Badge>
              )}
            </FormLabel>
            <CheckboxGroup
              value={responses[question.id] || []}
              onChange={(values) => handleInputChange(question.id, values)}
            >
              <Stack spacing={2}>
                {question.options?.map((option, idx) => (
                  <Checkbox key={idx} value={option}>
                    {option}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
            {hasError && (
              <FormErrorMessage>{errors[question.id]}</FormErrorMessage>
            )}
          </FormControl>
        );

      default:
        return (
          <FormControl
            key={question.id}
            isRequired={question.required}
            isInvalid={hasError}
          >
            <FormLabel>
              {index + 1}. {question.label}
              {question.required && (
                <Badge ml={2} colorScheme="red" fontSize="xs">
                  Required
                </Badge>
              )}
            </FormLabel>
            <Input
              value={responses[question.id] || ""}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder="Enter your answer"
            />
            {hasError && (
              <FormErrorMessage>{errors[question.id]}</FormErrorMessage>
            )}
          </FormControl>
        );
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader>
          <Heading variant="pageTitle">Form Response</Heading>
        </PageHeader>
        <Box flex="1" bg={contentBg} p={8}>
          <Center h="400px">
            <VStack>
              <Spinner size="xl" color="brandPrimary.500" />
              <Text mt={4} color="gray.600">
                Loading form template...
              </Text>
            </VStack>
          </Center>
        </Box>
        <PageFooter />
      </>
    );
  }

  if (!formTemplate) {
    return (
      <>
        <PageHeader>
          <Heading variant="pageTitle">Form Response</Heading>
        </PageHeader>
        <Box flex="1" bg={contentBg} p={8}>
          <Center h="400px">
            <VStack>
              <Text fontSize="xl" color="gray.600">
                Form template not found
              </Text>
              <Button
                colorScheme="brandPrimary"
                onClick={() => navigate("/documents")}
                mt={4}
              >
                Back to Documents
              </Button>
            </VStack>
          </Center>
        </Box>
        <PageFooter />
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <Breadcrumbs data={formTemplate} from="/documents" />
      </PageHeader>
      <Box flex="1" bg={contentBg} p={{ base: 4, md: 8 }}>
        <Container maxW="container.lg">
          <Card mb={6} bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Heading size="lg" mb={2}>
                    {formTemplate.title}
                  </Heading>
                  {formTemplate.description && (
                    <Text color="gray.600" fontSize="md">
                      {formTemplate.description}
                    </Text>
                  )}
                </Box>
                <Divider />
                <HStack>
                  <Badge colorScheme="green">Form Template</Badge>
                  <Text fontSize="sm" color="gray.600">
                    {formTemplate.metadata?.questions?.length || 0} questions
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {formTemplate.metadata?.questions &&
          formTemplate.metadata.questions.length > 0 ? (
            <VStack spacing={6} align="stretch">
              {formTemplate.metadata.questions.map((question, index) => (
                <Card key={question.id} bg={cardBg} borderColor={borderColor}>
                  <CardBody>{renderQuestion(question, index)}</CardBody>
                </Card>
              ))}
            </VStack>
          ) : (
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Center py={8}>
                  <Text color="gray.500">
                    This form template has no questions yet.
                  </Text>
                </Center>
              </CardBody>
            </Card>
          )}
        </Container>
      </Box>

      <PageFooter>
        <HStack spacing={3} justify="space-between" w="full">
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={() => navigate(`/document/${id}`)}
          >
            Back to Form Details
          </Button>
          <Button
            leftIcon={<FiSend />}
            colorScheme="brandPrimary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={
              !formTemplate.metadata?.questions ||
              formTemplate.metadata.questions.length === 0
            }
          >
            Submit Response
          </Button>
        </HStack>
      </PageFooter>
    </>
  );
};

export default FormResponse;
