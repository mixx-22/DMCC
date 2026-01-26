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
  Select,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useDocuments } from "../../../context/_useContext";

const CreateAuditScheduleModal = ({ isOpen, onClose, parentId, path }) => {
  const { createDocument } = useDocuments();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    type: "",
    standard: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Validation Error", {
        description: "Please enter a title for the audit schedule",
        duration: 3000,
      });
      return;
    }

    try {
      await createDocument({
        title: formData.title,
        description: formData.description,
        type: "auditSchedule",
        parentId,
        path,
        status: -1, // Draft
        metadata: {
          code: formData.code,
          type: formData.type,
          standard: formData.standard,
          status: -1,
          auditors: [],
          organization: {},
        },
      });

      toast.success("Audit Schedule Created", {
        description: `"${formData.title}" has been created as a draft`,
        duration: 3000,
      });

      setFormData({
        title: "",
        description: "",
        code: "",
        type: "",
        standard: "",
      });
      onClose();
    } catch (error) {
      toast.error("Failed to Create Audit Schedule", {
        description: `${error?.message || error || "Unknown error"}. Try again later or contact your System Administrator.`,
        duration: 3000,
      });
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      code: "",
      type: "",
      standard: "",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Create Audit Schedule</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter audit schedule title"
                  id="auditTitle"
                  name="auditTitle"
                />
              </FormControl>

              <FormControl>
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
                  rows={3}
                  id="auditDescription"
                  name="auditDescription"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Audit Code</FormLabel>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="e.g., AUD-2024-001"
                  id="auditCode"
                  name="auditCode"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Audit Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  placeholder="Select audit type"
                  id="auditType"
                  name="auditType"
                >
                  <option value="internal">Internal Audit</option>
                  <option value="external">External Audit</option>
                  <option value="compliance">Compliance Audit</option>
                  <option value="financial">Financial Audit</option>
                  <option value="operational">Operational Audit</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Standard</FormLabel>
                <Input
                  value={formData.standard}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      standard: e.target.value,
                    }))
                  }
                  placeholder="e.g., ISO 9001, SOX, etc."
                  id="auditStandard"
                  name="auditStandard"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" type="submit">
              Create Audit Schedule
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateAuditScheduleModal;
