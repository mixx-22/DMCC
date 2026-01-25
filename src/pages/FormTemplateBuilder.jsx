import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Switch,
  Text,
  IconButton,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Heading,
  Flex,
  NumberInput,
  NumberInputField,
  Checkbox,
  Radio,
  Stack,
  Spinner,
  Center,
  useColorModeValue,
  Spacer,
} from "@chakra-ui/react";
import { Select as ChakraSelect } from "chakra-react-select";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiMenu,
  FiArrowLeft,
  FiEdit2,
} from "react-icons/fi";
import { toast } from "sonner";
import { useDocuments } from "../context/_useContext";
import {
  createQuestion,
  INPUT_TYPES,
  requiresOptions,
  validateFormTemplate,
} from "../utils/formTemplateEngine";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";

// Sortable Question Component
const SortableQuestion = ({ question, index, onRemove, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Render the actual input field based on type
  const renderInputField = () => {
    const commonProps = {
      isReadOnly: true,
      placeholder: question.label || "Question label...",
      size: "md",
      cursor: "not-allowed",
    };

    switch (question.type) {
      case INPUT_TYPES.TEXT:
        return <Input {...commonProps} />;
      case INPUT_TYPES.NUMBER:
        return (
          <NumberInput {...commonProps}>
            <NumberInputField {...commonProps} />
          </NumberInput>
        );
      case INPUT_TYPES.CURRENCY:
        return (
          <NumberInput {...commonProps}>
            <NumberInputField {...commonProps} placeholder="$0.00" />
          </NumberInput>
        );
      case INPUT_TYPES.TEXTAREA:
        return <Textarea {...commonProps} rows={3} />;
      case INPUT_TYPES.DATE:
        return (
          <SingleDatepicker
            name="date-input"
            date={new Date()}
            disabled
            configs={{
              dateFormat: "MM/dd/yyyy",
            }}
          />
        );
      case INPUT_TYPES.SELECT:
      case INPUT_TYPES.DROPDOWN:
        return (
          <ChakraSelect
            isReadOnly
            isDisabled
            placeholder="Select option..."
            options={
              question.options?.map((opt) => ({
                value: opt,
                label: opt,
              })) || []
            }
          />
        );
      case INPUT_TYPES.RADIO:
        return (
          <VStack align="start" spacing={2}>
            {question.options?.map((option, idx) => (
              <Radio key={idx} isDisabled>
                {option}
              </Radio>
            ))}
            {(!question.options || question.options.length === 0) && (
              <Text fontSize="sm" color="gray.500">
                No options defined
              </Text>
            )}
          </VStack>
        );
      case INPUT_TYPES.CHECKBOXES:
        return (
          <VStack align="start" spacing={2}>
            {question.options?.map((option, idx) => (
              <Checkbox key={idx} isDisabled>
                {option}
              </Checkbox>
            ))}
            {(!question.options || question.options.length === 0) && (
              <Text fontSize="sm" color="gray.500">
                No options defined
              </Text>
            )}
          </VStack>
        );
      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <Stack spacing={4} ref={setNodeRef} style={style}>
      <Card variant="filled" boxShadow="none">
        <CardBody>
          <Flex gap={3} align="start">
            <VStack flex={1} align="stretch" spacing={3}>
              <Flex align="center">
                <IconButton
                  icon={<FiMenu />}
                  size="sm"
                  variant="ghost"
                  cursor="grab"
                  _active={{ cursor: "grabbing" }}
                  aria-label="Drag to reorder"
                  {...attributes}
                  {...listeners}
                />
                <HStack>
                  <Text fontWeight="medium" fontSize="sm" color="gray.600">
                    Question {index + 1}
                  </Text>
                  {question.required && (
                    <Tag size="sm" colorScheme="red" variant="subtle">
                      Required
                    </Tag>
                  )}
                </HStack>
                <Spacer />
                <HStack spacing={1}>
                  <IconButton
                    icon={<FiEdit2 />}
                    onClick={() => onEdit(question)}
                    size="sm"
                    colorScheme="brandPrimary"
                    variant="ghost"
                    aria-label="Edit question"
                  />
                  <IconButton
                    icon={<FiTrash2 />}
                    onClick={() => onRemove(question.id)}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    aria-label="Remove question"
                  />
                </HStack>
              </Flex>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  {question.label || "Untitled Question"}
                </FormLabel>
                {renderInputField()}
              </FormControl>
            </VStack>
          </Flex>
        </CardBody>
      </Card>
    </Stack>
  );
};

// Helper function to get display label for input type
const getTypeLabel = (type) => {
  const typeLabels = {
    [INPUT_TYPES.TEXT]: 'Text',
    [INPUT_TYPES.NUMBER]: 'Number',
    [INPUT_TYPES.CURRENCY]: 'Currency',
    [INPUT_TYPES.TEXTAREA]: 'Text Area',
    [INPUT_TYPES.DATE]: 'Date',
    [INPUT_TYPES.SELECT]: 'Select',
    [INPUT_TYPES.DROPDOWN]: 'Dropdown',
    [INPUT_TYPES.RADIO]: 'Radio',
    [INPUT_TYPES.CHECKBOXES]: 'Checkboxes',
  };
  return typeLabels[type] || 'Text';
};

const FormTemplateBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { createDocument, updateDocument, fetchDocumentById } = useDocuments();
  const { parentId, path } = location.state || {};

  // Dark mode colors
  const cardBg = useColorModeValue("white", "gray.700");
  const infoBg = useColorModeValue("info.50", "info.900");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState({
    label: "",
    type: INPUT_TYPES.TEXT,
    required: false,
    options: [],
  });

  const [currentOption, setCurrentOption] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [originalDocument, setOriginalDocument] = useState(null);

  useEffect(() => {
    const loadFormTemplate = async () => {
      if (id) {
        setLoadingForm(true);
        try {
          if (import.meta.env.DEV) {
            console.log("Loading form template with id:", id);
          }
          const document = await fetchDocumentById(id);
          if (import.meta.env.DEV) {
            console.log("Fetched document:", document);
          }

          if (document && document.type === "formTemplate") {
            if (import.meta.env.DEV) {
              console.log(
                "Setting form data and questions:",
                document.metadata?.questions,
              );
            }
            setFormData({
              title: document.title || "",
              description: document.description || "",
            });
            setQuestions(document.metadata?.questions || []);
            setIsEditMode(true);
            setDocumentId(id);
            setOriginalDocument(document);
          } else {
            if (import.meta.env.DEV) {
              console.log("Document is not a formTemplate or doesn't exist");
            }
            toast.error("Invalid Form Template", {
              description:
                "This document is not a form template or does not exist.",
            });
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Error loading form template:", error);
          }
          toast.error("Failed to load form template", {
            description: error.message,
          });
        } finally {
          setLoadingForm(false);
        }
      }
    };
    loadFormTemplate();
    // fetchDocumentById is intentionally excluded from dependencies
    // as it's not memoized in DocumentsContext and would cause infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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
    try {
      const question = createQuestion({
        label: currentQuestion.label || "Untitled Question",
        type: currentQuestion.type,
        required: currentQuestion.required,
        options:
          currentQuestion.options.length > 0
            ? currentQuestion.options
            : undefined,
      });

      if (editingQuestionId) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === editingQuestionId
              ? { ...question, id: editingQuestionId }
              : q,
          ),
        );
        toast.success("Question updated");
        setEditingQuestionId(null);
      } else {
        setQuestions((prev) => [...prev, question]);
        toast.success("Question added");
      }

      resetCurrentQuestion();
    } catch (error) {
      toast.error("Failed to add question", {
        description: error.message,
      });
    }
  };

  const handleEditQuestion = (question) => {
    setCurrentQuestion({
      label: question.label,
      type: question.type,
      required: question.required,
      options: question.options || [],
    });
    setEditingQuestionId(question.id);
    // Scroll to add question section
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleRemoveQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    if (editingQuestionId === questionId) {
      resetCurrentQuestion();
      setEditingQuestionId(null);
    }
    toast.success("Question removed");
  };

  const handleSave = async () => {
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
      const formTemplateData = {
        title: formData.title,
        description: formData.description,
        type: "formTemplate",
        status: 1,
        metadata: {
          questions,
        },
      };

      if (isEditMode && documentId) {
        if (!originalDocument) {
          if (import.meta.env.DEV) {
            console.warn(
              "Original document not available, using minimal update data",
            );
          }
          await updateDocument(
            { _id: documentId, id: documentId },
            formTemplateData,
          );
        } else {
          const updateData = {
            ...originalDocument,
            title: formData.title,
            description: formData.description,
            metadata: {
              ...originalDocument.metadata,
              questions,
            },
          };

          await updateDocument(originalDocument, updateData);
        }
        toast.success("Form Template Updated", {
          description: `"${formData.title}" has been updated successfully`,
        });
      } else {
        const newDoc = await createDocument({
          ...formTemplateData,
          parentId,
          path,
        });
        toast.success("Form Template Created", {
          description: `"${formData.title}" has been created successfully`,
        });
        // Redirect to document view for new forms
        if (newDoc?._id) {
          navigate(`/documents/${newDoc._id}`);
        } else {
          navigate("/documents");
        }
        return;
      }

      navigate("/documents");
    } catch (error) {
      toast.error(
        isEditMode
          ? "Failed to Update Form Template"
          : "Failed to Create Form Template",
        {
          description: `${error?.message || error || "Unknown error"}. Try again later or contact your System Administrator.`,
        },
      );
    }
  };

  const needsOptions = requiresOptions(currentQuestion.type);

  if (loadingForm) {
    return (
      <Box>
        <PageHeader>
          <HStack spacing={4}>
            <IconButton
              icon={<FiArrowLeft />}
              onClick={() => navigate("/documents")}
              variant="ghost"
              aria-label="Back to documents"
            />
            <Heading variant="pageTitle">Edit Form Template</Heading>
          </HStack>
        </PageHeader>
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="brandPrimary.500" thickness="4px" />
            <Text fontSize="lg" color="gray.600">
              Loading form template...
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader>
        <HStack spacing={4}>
          <IconButton
            icon={<FiArrowLeft />}
            onClick={() => navigate("/documents")}
            variant="ghost"
            aria-label="Back to documents"
          />
          <Heading variant="pageTitle">
            {isEditMode ? "Edit Form Template" : "Create Form Template"}
          </Heading>{" "}
        </HStack>
      </PageHeader>
      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          <Button
            variant="ghost"
            onClick={() => {
              if (isEditMode && documentId) {
                // For existing form, go to document view
                navigate(`/documents/${documentId}`);
              } else {
                // For new form, just go back
                navigate("/documents");
              }
            }}
          >
            Cancel
          </Button>
          <Button
            leftIcon={<FiSave />}
            colorScheme="brandPrimary"
            onClick={handleSave}
          >
            Save Form Template
          </Button>
        </Flex>
      </PageFooter>
      <Flex gap={4} maxW="container.xl" flexDir={{ base: "column", lg: "row" }}>
        <Stack spacing={4} w="full" maxW={{ base: "unset", lg: "xs" }}>
          {/* Form Information */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Form Information</Heading>
                <Stack spacing={4}>
                  <FormControl isRequired flex={1}>
                    <FormLabel>Form Title</FormLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter form title"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl flex={1}>
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
                      size="lg"
                    />
                  </FormControl>
                </Stack>
              </VStack>
            </CardBody>
          </Card>
        </Stack>
        <Stack spacing={4} flex={1}>
          {/* Form Preview with Questions */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Heading size="md">Form Preview</Heading>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    {questions.length} question
                    {questions.length !== 1 ? "s" : ""}
                  </Text>
                </Flex>
                <Divider />

                {/* Questions List */}
                {questions.length === 0 ? (
                  <Box p={8} textAlign="center">
                    <Text color="gray.500" mb={2}>
                      No questions yet. Add your first question below.
                    </Text>
                  </Box>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={questions.map((q) => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <VStack spacing={3} align="stretch">
                        {questions.map((question, index) => (
                          <SortableQuestion
                            key={question.id}
                            question={question}
                            index={index}
                            onRemove={handleRemoveQuestion}
                            onEdit={handleEditQuestion}
                          />
                        ))}
                      </VStack>
                    </SortableContext>
                  </DndContext>
                )}

                <Divider />

                {/* Add New Question - Inline at bottom */}
                <Box
                  p={4}
                  borderWidth={2}
                  borderStyle="dashed"
                  borderColor="brandPrimary.300"
                  borderRadius="md"
                  bg={infoBg}
                >
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Heading size="sm" color="brandPrimary.700">
                        Add New Question
                      </Heading>
                      <HStack>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0" fontSize="sm" mr={2}>
                            Required
                          </FormLabel>
                          <Switch
                            size="sm"
                            isChecked={currentQuestion.required}
                            onChange={(e) =>
                              setCurrentQuestion((prev) => ({
                                ...prev,
                                required: e.target.checked,
                              }))
                            }
                            colorScheme="brandPrimary"
                          />
                        </FormControl>
                      </HStack>
                    </Flex>

                    <Flex gap={3} direction={{ base: "column", md: "row" }}>
                      <FormControl flex={2}>
                        <Input
                          value={currentQuestion.label}
                          onChange={(e) =>
                            setCurrentQuestion((prev) => ({
                              ...prev,
                              label: e.target.value,
                            }))
                          }
                          placeholder="Question label (optional)"
                          size="md"
                          bg={cardBg}
                        />
                      </FormControl>

                      <FormControl flex={1}>
                        <ChakraSelect
                          value={{
                            value: currentQuestion.type,
                            label: getTypeLabel(currentQuestion.type)
                          }}
                          onChange={(option) =>
                            setCurrentQuestion((prev) => ({
                              ...prev,
                              type: option?.value || INPUT_TYPES.TEXT,
                              options: [],
                            }))
                          }
                          options={[
                            { value: INPUT_TYPES.TEXT, label: 'Text' },
                            { value: INPUT_TYPES.NUMBER, label: 'Number' },
                            { value: INPUT_TYPES.CURRENCY, label: 'Currency' },
                            { value: INPUT_TYPES.TEXTAREA, label: 'Text Area' },
                            { value: INPUT_TYPES.DATE, label: 'Date' },
                            { value: INPUT_TYPES.SELECT, label: 'Select' },
                            { value: INPUT_TYPES.DROPDOWN, label: 'Dropdown' },
                            { value: INPUT_TYPES.RADIO, label: 'Radio' },
                            { value: INPUT_TYPES.CHECKBOXES, label: 'Checkboxes' },
                          ]}
                        />
                      </FormControl>
                    </Flex>

                    {needsOptions && (
                      <FormControl>
                        <HStack>
                          <Input
                            value={currentOption}
                            onChange={(e) => setCurrentOption(e.target.value)}
                            placeholder="Enter an option"
                            size="sm"
                            bg={cardBg}
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
                            colorScheme="brandPrimary"
                            size="sm"
                            aria-label="Add option"
                          />
                        </HStack>

                        {currentQuestion.options.length > 0 && (
                          <Wrap mt={2}>
                            {currentQuestion.options.map((option, index) => (
                              <WrapItem key={index}>
                                <Tag
                                  size="sm"
                                  colorScheme="brandPrimary"
                                  variant="solid"
                                >
                                  <TagLabel>{option}</TagLabel>
                                  <TagCloseButton
                                    onClick={() => handleRemoveOption(index)}
                                  />
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        )}
                      </FormControl>
                    )}

                    <Button
                      leftIcon={editingQuestionId ? <FiEdit2 /> : <FiPlus />}
                      onClick={handleAddQuestion}
                      colorScheme={editingQuestionId ? "orange" : "info"}
                      size="md"
                      w="full"
                    >
                      {editingQuestionId ? "Update Question" : "Add Question"}
                    </Button>
                    {editingQuestionId && (
                      <Button
                        onClick={() => {
                          resetCurrentQuestion();
                          setEditingQuestionId(null);
                        }}
                        variant="ghost"
                        size="sm"
                        w="full"
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </Stack>
      </Flex>
    </Box>
  );
};

export default FormTemplateBuilder;
