import {
  VStack,
  HStack,
  Box,
  Text,
  FormLabel,
  Textarea,
  Button,
  FormControl,
  FormHelperText,
  useColorModeValue,
  Divider,
  Heading,
  Card,
  CardBody,
  Avatar,
  Tooltip,
  Wrap,
  WrapItem,
  SimpleGrid,
  FormErrorMessage,
  IconButton,
  Center,
  Icon,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FiSave, FiX, FiUploadCloud, FiFile } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import TeamLeadersSelect from "../../../components/TeamLeadersSelect";
import { useLayout, useUser } from "../../../context/_useContext";
import Timestamp from "../../../components/Timestamp";
import apiService from "../../../services/api";
import { uploadFileToServer, formatFileSize } from "../../../utils/fileUpload";
import { ListView } from "../../../components/Document/ListView";
import { ACCEPTED_MIME } from "../../../constants";

// Helper function to get user's full name from either format
const getUserFullName = (user) => {
  if (!user) return "";
  // Handle combined name field (API format)
  if (user.name) return user.name;
  // Handle separate firstName/lastName fields (legacy format)
  return `${user.firstName || ""} ${user.lastName || ""}`.trim();
};

// Helper to map attachments to ListView document format
const mapAttachmentsToDocuments = (attachments, owner) => {
  if (!attachments || attachments.length === 0) return [];
  return attachments.map((att, idx) => ({
    id: att._id || att.key || idx,
    _id: att._id || att.key || idx,
    title: att.fileName || att.filename || "Untitled",
    type: "file",
    owner: {
      ...owner,
      firstName: owner?.name.split(" ")[0],
      lastName: owner?.name.split(" ").pop(),
    },
    metadata: {
      filename: att.fileName || att.filename,
      size: att.size,
      key: att.key,
      version: att.version || "1.0",
      fileType: att.fileType || undefined,
    },
    createdAt: att.uploadedAt || att.createdAt,
    updatedAt: att.uploadedAt || att.updatedAt,
    ...att,
  }));
};

const ActionPlanForm = ({
  initialData = null,
  team = null, // Team object for leaders
  onSave,
  onCancel,
  readOnly = false,
}) => {
  const bg = useColorModeValue("info.50", "info.900");
  const borderColor = useColorModeValue("info.200", "info.700");
  const sectionBg = useColorModeValue("white", "gray.800");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const { pageRef } = useLayout();
  const { user: currentUser } = useUser();

  // Initialize form data
  const getInitialFormData = () => {
    // If editing existing action plan, use existing auditor
    // Otherwise, auto-populate with current logged-in user
    const defaultAuditor = currentUser
      ? [
          {
            _id: currentUser._id || currentUser.id,
            id: currentUser._id || currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
          },
        ]
      : [];

    if (initialData) {
      return {
        rootCause: initialData.rootCause || "",
        owner: Array.isArray(initialData.owner)
          ? initialData.owner
          : initialData.owner
            ? [initialData.owner]
            : [],
        proposedDate: initialData.proposedDate
          ? new Date(initialData.proposedDate)
          : new Date(),
        correctiveAction: initialData.correctiveAction || "",
        takenBy: Array.isArray(initialData.takenBy)
          ? initialData.takenBy
          : initialData.takenBy
            ? [initialData.takenBy]
            : [],
        auditor: Array.isArray(initialData.auditor)
          ? initialData.auditor
          : initialData.auditor
            ? [initialData.auditor]
            : defaultAuditor,
        attachments: Array.isArray(initialData.attachments)
          ? initialData.attachments
          : initialData.attachment
            ? [initialData.attachment]
            : [],
      };
    }
    return {
      rootCause: "",
      owner: [],
      proposedDate: new Date(),
      correctiveAction: "",
      takenBy: [],
      auditor: defaultAuditor,
      attachments: [],
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Root Cause Analysis validation
    if (!formData.rootCause.trim()) {
      newErrors.rootCause = "Root cause is required";
    }
    if (!formData.owner || formData.owner.length === 0) {
      newErrors.owner = "At least one owner is required";
    }

    // Corrective Action validation
    if (!formData.correctiveAction.trim()) {
      newErrors.correctiveAction = "Corrective action is required";
    }
    if (!formData.takenBy || formData.takenBy.length === 0) {
      newErrors.takenBy = "At least one person responsible is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownloadAttachment = async (attachment) => {
    if (!attachment?.key || !attachment?.fileName) return;

    try {
      setDownloadingAttachment(true);
      const blob = await apiService.downloadDocument(
        attachment.fileName,
        attachment.key,
      );
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = attachment.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download action plan attachment:", error);
      setErrors((prev) => ({
        ...prev,
        attachment: error.message || "Failed to download attachment",
      }));
    } finally {
      setDownloadingAttachment(false);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      let attachments = Array.isArray(formData.attachments)
        ? formData.attachments
        : formData.attachment
          ? [formData.attachment]
          : [];

      if (selectedFiles.length > 0) {
        try {
          setIsUploadingFile(true);
          const uploadedAttachments = [];
          for (const file of selectedFiles) {
            const uploaded = await uploadFileToServer(file, apiService);
            uploadedAttachments.push({
              fileName: uploaded.filename || file.name,
              key: uploaded.key,
              size: uploaded.size ?? file.size,
              uploadedAt: new Date().toISOString(),
              uploadedBy: currentUser
                ? {
                    id: currentUser._id || currentUser.id,
                    name: getUserFullName(currentUser),
                  }
                : null,
            });
          }
          attachments = [...attachments, ...uploadedAttachments];
        } catch (error) {
          setErrors((prev) => ({
            ...prev,
            attachment: error.message || "Failed to upload attachment",
          }));
          setIsUploadingFile(false);
          return;
        } finally {
          setIsUploadingFile(false);
        }
      }

      const actionPlanData = {
        ...formData,
        proposedDate: formData.proposedDate.toISOString().split("T")[0],
        attachments,
        // Backward compatibility for existing readers
        attachment: attachments[0] || null,
      };

      if (onSave) {
        await onSave(actionPlanData);
      }
    }
  };

  if (readOnly) {
    // Read-only display mode (following FindingsList user display pattern)
    return (
      <Box>
        <VStack align="stretch" spacing={4}>
          {/* Root Cause Analysis Section */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="info.700" mb={2}>
              Root Cause Analysis
            </Text>
            <VStack align="stretch" spacing={3}>
              {formData.rootCause && (
                <Box>
                  <Text fontSize="xs" color={labelColor} mb={1}>
                    Root Cause:
                  </Text>
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {formData.rootCause}
                  </Text>
                </Box>
              )}
              <SimpleGrid columns={[1, 1, 2]}>
                {formData.owner && formData.owner.length > 0 && (
                  <Box>
                    <Text fontSize="xs" color={labelColor} mb={1}>
                      Owner(s):
                    </Text>
                    <Wrap>
                      {formData.owner.map((u, index) => {
                        const fullName = getUserFullName(u);
                        return (
                          <WrapItem key={`owner-${u.id}-${index}`}>
                            <Tooltip label={fullName}>
                              <Card variant="filled" shadow="none">
                                <CardBody px={2} py={1}>
                                  <HStack spacing={1}>
                                    <Avatar size="xs" name={fullName} />
                                    <Text fontSize="sm">{fullName}</Text>
                                  </HStack>
                                </CardBody>
                              </Card>
                            </Tooltip>
                          </WrapItem>
                        );
                      })}
                    </Wrap>
                  </Box>
                )}
                {formData.proposedDate && (
                  <Box>
                    <Text fontSize="xs" color={labelColor} mb={1}>
                      Proposed Completion Date:
                    </Text>
                    <Timestamp date={formData.proposedDate} fontSize="sm" />
                  </Box>
                )}
              </SimpleGrid>
            </VStack>
          </Box>
          <Divider />
          {/* Corrective Action Section */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="info.700" mb={2}>
              Corrective Action
            </Text>
            <VStack align="stretch" spacing={3}>
              {formData.correctiveAction && (
                <Box>
                  <Text fontSize="xs" color={labelColor} mb={1}>
                    Corrective Action:
                  </Text>
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {formData.correctiveAction}
                  </Text>
                </Box>
              )}
              <SimpleGrid columns={[1, 1, 2]}>
                {formData.takenBy && formData.takenBy.length > 0 && (
                  <Box>
                    <Text fontSize="xs" color={labelColor} mb={1}>
                      Taken By:
                    </Text>
                    <Wrap>
                      {formData.takenBy.map((u, index) => {
                        const fullName = getUserFullName(u);
                        return (
                          <WrapItem key={`takenby-${u.id}-${index}`}>
                            <Tooltip label={fullName}>
                              <Card variant="filled" shadow="none">
                                <CardBody px={2} py={1}>
                                  <HStack spacing={1}>
                                    <Avatar size="xs" name={fullName} />
                                    <Text fontSize="sm">{fullName}</Text>
                                  </HStack>
                                </CardBody>
                              </Card>
                            </Tooltip>
                          </WrapItem>
                        );
                      })}
                    </Wrap>
                  </Box>
                )}
                {formData.auditor && formData.auditor.length > 0 && (
                  <Box>
                    <Text fontSize="xs" color={labelColor} mb={1}>
                      Verified By:
                    </Text>
                    <Wrap>
                      {formData.auditor.map((u, index) => {
                        const fullName = getUserFullName(u);
                        return (
                          <WrapItem key={`auditor-${u.id}-${index}`}>
                            <Tooltip label={fullName}>
                              <Card variant="filled" shadow="none">
                                <CardBody px={2} py={1}>
                                  <HStack spacing={1}>
                                    <Avatar size="xs" name={fullName} />
                                    <Text fontSize="sm">{fullName}</Text>
                                  </HStack>
                                </CardBody>
                              </Card>
                            </Tooltip>
                          </WrapItem>
                        );
                      })}
                    </Wrap>
                  </Box>
                )}
              </SimpleGrid>
            </VStack>
          </Box>

          <Divider />

          {(formData.attachments?.length > 0 || formData.attachment) && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="info.700" mb={2}>
                Attached Document(s):
              </Text>
              <VStack align="stretch" spacing={2}>
                <ListView
                  documents={mapAttachmentsToDocuments(
                    formData.attachments?.length > 0
                      ? formData.attachments
                      : [formData.attachment].filter(Boolean),
                    formData.owner?.[0] || null,
                  )}
                  selectedDocument={null}
                  onDocumentClick={() => {}}
                  onRowClick={(e, doc) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDownloadAttachment(doc);
                  }}
                  filesOnly
                  sourcePage={{
                    path: window.location.pathname,
                    label: "Action Plan Attachments",
                  }}
                  actions={(doc) => (
                    <Tooltip label="Download attachment">
                      <span>
                        <IconButton
                          icon={<FiUploadCloud />}
                          size="sm"
                          variant="ghost"
                          aria-label="Download attachment"
                          colorScheme="info"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDownloadAttachment(doc);
                          }}
                          isLoading={downloadingAttachment}
                        />
                      </span>
                    </Tooltip>
                  )}
                />
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    );
  }

  // Edit mode
  return (
    <Box
      p={4}
      bg={bg}
      borderWidth={2}
      borderRadius="md"
      borderStyle="dashed"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Heading size="sm" color="info.600">
            {initialData ? "Edit Action Plan" : "Add Action Plan"}
          </Heading>
          {onCancel && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FiX />}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </HStack>

        <Divider />

        {/* Phase 1: Root Cause Analysis */}
        <Box p={3} bg={sectionBg} borderRadius="md">
          <Text fontSize="sm" fontWeight="bold" color="info.700" mb={3}>
            Phase 1: Root Cause Analysis
          </Text>

          <VStack align="stretch" spacing={3}>
            {/* Root Cause */}
            <FormControl isInvalid={errors.rootCause}>
              <FormLabel fontSize="sm">Root Cause *</FormLabel>
              <Textarea
                value={formData.rootCause}
                onChange={(e) => handleChange("rootCause", e.target.value)}
                placeholder="Describe the root cause of the non-conformity..."
                size="sm"
                rows={4}
              />
              {errors.rootCause && (
                <FormHelperText color="error.500">
                  {errors.rootCause}
                </FormHelperText>
              )}
            </FormControl>

            {/* Owner */}
            <FormControl isInvalid={errors.owner}>
              <FormLabel fontSize="sm">Owner(s) *</FormLabel>
              <TeamLeadersSelect
                label=""
                value={formData.owner || []}
                onChange={(users) => handleChange("owner", users)}
                placeholder="Select owner(s) responsible for resolution"
                displayMode="none"
                team={team}
              />
              {errors.owner && (
                <FormHelperText color="error.500">
                  {errors.owner}
                </FormHelperText>
              )}
            </FormControl>

            {/* Proposed Date */}
            <FormControl>
              <FormLabel fontSize="sm">Proposed Completion Date *</FormLabel>
              <SingleDatepicker
                date={formData.proposedDate}
                onDateChange={(date) => handleChange("proposedDate", date)}
                configs={{ dateFormat: "MMMM dd, yyyy" }}
                propsConfigs={{
                  inputProps: {
                    size: "sm",
                  },
                  triggerBtnProps: {
                    size: "sm",
                    w: "full",
                  },
                }}
                usePortal
                portalRef={pageRef}
              />
            </FormControl>
          </VStack>
        </Box>

        {/* Phase 2: Corrective Action */}
        <Box p={3} bg={sectionBg} borderRadius="md">
          <Text fontSize="sm" fontWeight="bold" color="info.700" mb={3}>
            Phase 2: Corrective Action
          </Text>

          <VStack align="stretch" spacing={3}>
            {/* Corrective Action */}
            <FormControl isInvalid={errors.correctiveAction}>
              <FormLabel fontSize="sm">Corrective Action *</FormLabel>
              <Textarea
                value={formData.correctiveAction}
                onChange={(e) =>
                  handleChange("correctiveAction", e.target.value)
                }
                placeholder="Describe the corrective action taken..."
                size="sm"
                rows={4}
              />
              {errors.correctiveAction && (
                <FormHelperText color="error.500">
                  {errors.correctiveAction}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl isInvalid={Boolean(errors.attachment)}>
              <FormLabel fontSize="sm">Attachment (optional)</FormLabel>
              {/* Dropzone area for file upload */}
              <DropzoneArea
                onFilesAdded={(files) => {
                  setSelectedFiles(files);
                  setErrors((prev) => ({ ...prev, attachment: null }));
                }}
                accept={ACCEPTED_MIME}
                multiple
                isDisabled={isUploadingFile}
                selectedFiles={selectedFiles}
                onRemoveFile={(idx) => {
                  setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
                }}
              />
              <FormHelperText>
                Attach one or more supporting documents for this action plan.
              </FormHelperText>
              {selectedFiles.length > 0 &&
                (formData.attachments?.length > 0 || formData.attachment) && (
                  <Box>
                    <ListView
                      documents={mapAttachmentsToDocuments(
                        formData.attachments?.length > 0
                          ? formData.attachments
                          : [formData.attachment].filter(Boolean),
                        formData.owner?.[0] || null,
                      )}
                      selectedDocument={null}
                      onDocumentClick={() => {}}
                      filesOnly
                      sourcePage={{
                        path: window.location.pathname,
                        label: "Action Plan Attachments",
                      }}
                      actions={(doc) => (
                        <Tooltip label="Download attachment">
                          <span>
                            <IconButton
                              icon={<FiUploadCloud />}
                              size="sm"
                              variant="ghost"
                              aria-label="Download attachment"
                              colorScheme="info"
                              onClick={() => handleDownloadAttachment(doc)}
                              isLoading={downloadingAttachment}
                            />
                          </span>
                        </Tooltip>
                      )}
                    />
                  </Box>
                )}
              {errors.attachment && (
                <FormErrorMessage>{errors.attachment}</FormErrorMessage>
              )}
            </FormControl>

            {/* Taken By */}
            <FormControl isInvalid={errors.takenBy}>
              <FormLabel fontSize="sm">Taken By *</FormLabel>
              <TeamLeadersSelect
                label=""
                value={formData.takenBy || []}
                onChange={(users) => handleChange("takenBy", users)}
                placeholder="Select person(s) who implemented the action"
                displayMode="none"
                team={team}
              />
              {errors.owner && (
                <FormHelperText color="error.500">
                  {errors.owner}
                </FormHelperText>
              )}
            </FormControl>

            {/* Auditor - Auto-populated with current user */}
            <Box>
              <Text fontSize="sm" color={labelColor} mb={2}>
                Verified By:
              </Text>
              {formData.auditor && formData.auditor.length > 0 ? (
                <Wrap spacing={1}>
                  {formData.auditor.map((user, idx) => {
                    const fullName = getUserFullName(user);
                    return (
                      <WrapItem key={`auditor-${user._id || user.id}-${idx}`}>
                        <Card variant="filled" shadow="none" bg="info.100">
                          <CardBody px={2} py={1}>
                            <HStack spacing={1}>
                              <Avatar size="xs" name={fullName} />
                              <Text fontSize="sm" fontWeight="medium">
                                {fullName}
                              </Text>
                            </HStack>
                          </CardBody>
                        </Card>
                      </WrapItem>
                    );
                  })}
                </Wrap>
              ) : (
                <Text fontSize="sm" color="red.500">
                  Current user not available
                </Text>
              )}
              <Text fontSize="xs" color={labelColor} mt={1}>
                Automatically set to current logged-in user
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Submit Button */}
        <HStack justify="flex-end">
          <Button
            leftIcon={<FiSave />}
            colorScheme="info"
            size="sm"
            onClick={handleSubmit}
            isLoading={isUploadingFile}
            loadingText="Uploading..."
          >
            Save Action Plan
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ActionPlanForm;

// DropzoneArea component for drag-and-drop file upload, styled like UploadFileModal
function DropzoneArea({
  onFilesAdded,
  accept,
  multiple = true,
  isDisabled = false,
  selectedFiles = [],
  onRemoveFile,
}) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (onFilesAdded) onFilesAdded(acceptedFiles);
    },
    [onFilesAdded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept,
    disabled: isDisabled,
  });

  // Show Dropzone if no files selected
  if (!selectedFiles || selectedFiles.length === 0) {
    return (
      <Box
        {...getRootProps()}
        border="2px dashed"
        borderColor={isDragActive ? "info.400" : "gray.300"}
        borderRadius="lg"
        p={8}
        textAlign="center"
        cursor={isDisabled ? "not-allowed" : "pointer"}
        bg={isDragActive ? "info.50" : "gray.50"}
        transition="all 0.2s"
        _hover={{
          borderColor: isDisabled ? "gray.300" : "info.400",
          bg: isDisabled ? "gray.50" : "info.50",
        }}
        opacity={isDisabled ? 0.6 : 1}
        mb={2}
      >
        <input {...getInputProps()} />
        <Center>
          <Icon
            as={FiUploadCloud}
            w={12}
            h={12}
            color={isDragActive ? "info.500" : "gray.400"}
            mb={3}
          />
        </Center>
        <Text fontSize="md" fontWeight="medium" mb={1}>
          {isDragActive ? "Drop your file(s) here" : "Drag & drop file(s) here"}
        </Text>
        <Text fontSize="sm" color="gray.500">
          or click to browse
        </Text>
      </Box>
    );
  }

  // Show file preview(s) with remove button
  return (
    <VStack align="stretch" spacing={2} mb={2}>
      {selectedFiles.map((file, idx) => (
        <Box
          key={`${file.name}-${idx}`}
          p={4}
          bg="gray.50"
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" flex="1">
              <Icon as={FiFile} w={5} h={5} color="info.500" mr={3} />
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                  {file.name}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {typeof file.size === "number"
                    ? formatFileSize(file.size)
                    : ""}
                </Text>
              </Box>
            </Box>
            {onRemoveFile && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => onRemoveFile(idx)}
                leftIcon={<FiX />}
                ml={2}
              >
                Remove
              </Button>
            )}
          </Box>
        </Box>
      ))}
    </VStack>
  );
}
