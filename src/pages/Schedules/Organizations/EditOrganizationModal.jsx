import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { FiSave, FiX } from "react-icons/fi";
import { toast } from "sonner";
import UserAsyncSelect from "../../../components/UserAsyncSelect";
import VisitManager from "./VisitManager";
import { useOrganizations } from "../../../context/_useContext";

const EditOrganizationModal = ({ isOpen, onClose, organization }) => {
  const { updateOrganization, dispatch } = useOrganizations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    auditors: [],
    visits: [],
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Pre-fill form when modal opens
  useEffect(() => {
    if (isOpen && organization) {
      setFormData({
        auditors: organization.auditors || [],
        visits: organization.visits || [],
      });
      setValidationErrors({});
    }
  }, [isOpen, organization]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.auditors || formData.auditors.length === 0) {
      errors.auditors = "At least one auditor is required";
    }
    if (!formData.visits || formData.visits.length === 0) {
      errors.visits = "At least one visit is required";
    }
    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSave = useCallback(async () => {
    const v = validateForm();
    if (!v.isValid) {
      toast.error("Invalid Form Data", {
        description: Object.values(v.errors)?.[0],
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        auditors: formData.auditors,
        visits: formData.visits,
      };

      const updated = await updateOrganization(organization._id, payload);

      if (updated) {
        dispatch({
          type: "UPDATE_ORGANIZATION",
          payload: { ...organization, ...payload, _id: organization._id },
        });
      }

      onClose();
    } catch (error) {
      console.error("Failed to update organization:", error);
      toast.error("Failed to Update Organization", {
        description: error.message || "Try again later or contact your System Administrator",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, organization, updateOrganization, dispatch, onClose]);

  const handleClose = () => {
    setValidationErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Organization</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <UserAsyncSelect
              value={formData.auditors}
              placeholder="Start searching for Users..."
              onChange={(users) => handleFieldChange("auditors", users)}
              isInvalid={!!validationErrors.auditors}
              displayMode="none"
              label="Auditors"
              limit={5}
              roleFilter="Internal Auditor"
              allowEmptySearch
            />
            <Divider />
            <VisitManager
              visits={formData.visits}
              onChange={(visits) => handleFieldChange("visits", visits)}
              isInvalid={!!validationErrors.visits}
            />
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            leftIcon={<FiX />}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            colorScheme="brandPrimary"
            onClick={handleSave}
            leftIcon={<FiSave />}
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditOrganizationModal;
