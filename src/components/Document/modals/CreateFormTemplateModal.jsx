import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Select,
  Switch,
  Text,
  Box,
  IconButton,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";
import { useDocuments } from "../../../context/_useContext";
import {
  createQuestion,
  INPUT_TYPES,
  requiresOptions,
  validateFormTemplate,
} from "../../../utils/formTemplateEngine";

const CreateFormTemplateModal = ({ isOpen, onClose, parentId, path }) => {
  const { createDocument } = useDocuments();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [questions, setQuestions] = useState([]);
  
  const [currentQuestion, setCurrentQuestion] = useState({
    label: "",
    type: INPUT_TYPES.TEXT,
    required: false,
    options: [],
  });

  const [currentOption, setCurrentOption] = useState("");

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      label: "",
      type: INPUT_TYPES.TEXT,
      required: false,
      options: [],
    });
    setCurrentOption("");
  };

  const handleAddOption = () => {
    if (!currentOption.trim()) {
      toast.error("Option cannot be empty");
      return;
    }

    if (currentQuestion.options.includes(currentOption.trim())) {
      toast.error("This option already exists");
      return;
    }

    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, currentOption.trim()],
    }));
    setCurrentOption("");
  };

  const handleRemoveOption = (indexToRemove) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.label.trim()) {
      toast.error("Question label is required");
      return;
    }

    try {
      const question = createQuestion({
        label: currentQuestion.label,
        type: currentQuestion.type,
        required: currentQuestion.required,
        options: currentQuestion.options.length > 0 ? currentQuestion.options : undefined,
      });

      setQuestions((prev) => [...prev, question]);
      resetCurrentQuestion();
      
      toast.success("Question added successfully");
    } catch (error) {
      toast.error("Failed to add question", {
        description: error.message,
      });
    }
  };

  const handleRemoveQuestion = (indexToRemove) => {
    setQuestions((prev) => prev.filter((_, index) => index !== indexToRemove));
    toast.success("Question removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Validation Error", {
        description: "Please enter a title for the form template",
      });
      return;
    }

    if (questions.length === 0) {
      toast.error("Validation Error", {
        description: "Please add at least one question to the form",
      });
      return;
    }

    // Validate the form template
    const validation = validateFormTemplate(questions);
    if (!validation.isValid) {
      toast.error("Form Template Validation Failed", {
        description: validation.errors.join("; "),
      });
      return;
    }

    try {
      await createDocument({
        title: formData.title,
        description: formData.description,
        type: "formTemplate",
        parentId,
        path,
        status: 1, // Auto-approved
        metadata: {
          questions,
        },
      });

      toast.success("Form Template Created", {
        description: `"${formData.title}" has been created successfully`,
      });

      setFormData({ title: "", description: "" });
      setQuestions([]);
      resetCurrentQuestion();
      onClose();
    } catch (error) {
      toast.error("Failed to Create Form Template", {
        description: `${error?.message || error || "Unknown error"}. Try again later or contact your System Administrator.`,
      });
    }
  };

  const handleClose = () => {
    setFormData({ title: "", description: "" });
    setQuestions([]);
    resetCurrentQuestion();
    onClose();
  };

  const needsOptions = requiresOptions(currentQuestion.type);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <form onSubmit={handleSubmit}>
          <ModalHeader>Create Form Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Form Template Info */}
              <Box>
                <FormControl isRequired>
                  <FormLabel>Form Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter form template title"
                  />
                </FormControl>

                <FormControl mt={4}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Optional description"
                    rows={2}
                  />
                </FormControl>
              </Box>

              <Divider />

              {/* Question Builder */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Add Questions
                </Text>

                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Question Label</FormLabel>
                    <Input
                      value={currentQuestion.label}
                      onChange={(e) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      placeholder="Enter question text"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Input Type</FormLabel>
                    <Select
                      value={currentQuestion.type}
                      onChange={(e) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          type: e.target.value,
                          options: [], // Reset options when type changes
                        }))
                      }
                    >
                      <option value={INPUT_TYPES.TEXT}>Text</option>
                      <option value={INPUT_TYPES.NUMBER}>Number</option>
                      <option value={INPUT_TYPES.CURRENCY}>Currency</option>
                      <option value={INPUT_TYPES.TEXTAREA}>Text Area</option>
                      <option value={INPUT_TYPES.DATE}>Date</option>
                      <option value={INPUT_TYPES.SELECT}>Select</option>
                      <option value={INPUT_TYPES.DROPDOWN}>Dropdown</option>
                      <option value={INPUT_TYPES.CHECKBOXES}>Checkboxes</option>
                    </Select>
                  </FormControl>

                  {needsOptions && (
                    <FormControl>
                      <FormLabel>Options</FormLabel>
                      <HStack>
                        <Input
                          value={currentOption}
                          onChange={(e) => setCurrentOption(e.target.value)}
                          placeholder="Enter an option"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddOption();
                            }
                          }}
                        />
                        <IconButton
                          icon={<FiPlus />}
                          onClick={handleAddOption}
                          colorScheme="green"
                          aria-label="Add option"
                        />
                      </HStack>
                      
                      {currentQuestion.options.length > 0 && (
                        <Wrap mt={2}>
                          {currentQuestion.options.map((option, index) => (
                            <WrapItem key={index}>
                              <Tag size="md" colorScheme="blue" variant="subtle">
                                <TagLabel>{option}</TagLabel>
                                <TagCloseButton
                                  onClick={() => handleRemoveOption(index)}
                                />
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      )}
                      
                      {currentQuestion.options.length === 0 && (
                        <Alert status="warning" mt={2} size="sm">
                          <AlertIcon />
                          <AlertDescription fontSize="sm">
                            This input type requires at least one option
                          </AlertDescription>
                        </Alert>
                      )}
                    </FormControl>
                  )}

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Required Field</FormLabel>
                    <Switch
                      isChecked={currentQuestion.required}
                      onChange={(e) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          required: e.target.checked,
                        }))
                      }
                    />
                  </FormControl>

                  <Button
                    leftIcon={<FiPlus />}
                    onClick={handleAddQuestion}
                    colorScheme="green"
                    size="sm"
                    alignSelf="flex-start"
                  >
                    Add Question
                  </Button>
                </VStack>
              </Box>

              {/* Questions List */}
              {questions.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>
                      Questions ({questions.length})
                    </Text>
                    
                    <VStack spacing={3} align="stretch">
                      {questions.map((question, index) => (
                        <Box
                          key={question.id}
                          p={3}
                          borderWidth={1}
                          borderRadius="md"
                          borderColor="gray.200"
                        >
                          <HStack justify="space-between" align="start">
                            <VStack align="start" flex={1} spacing={1}>
                              <HStack>
                                <Text fontWeight="medium">
                                  {index + 1}. {question.label}
                                </Text>
                                {question.required && (
                                  <Tag size="sm" colorScheme="red" variant="subtle">
                                    Required
                                  </Tag>
                                )}
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                Type: {question.type}
                              </Text>
                              {question.options && (
                                <Text fontSize="sm" color="gray.600">
                                  Options: {question.options.join(", ")}
                                </Text>
                              )}
                            </VStack>
                            <IconButton
                              icon={<FiTrash2 />}
                              onClick={() => handleRemoveQuestion(index)}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              aria-label="Remove question"
                            />
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brandPrimary"
              type="submit"
              leftIcon={<FiCheckCircle />}
            >
              Create Form Template
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateFormTemplateModal;
