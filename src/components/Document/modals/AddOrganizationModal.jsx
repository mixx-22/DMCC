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
  VStack,
} from "@chakra-ui/react";
import { toast } from "sonner";
import TeamAsyncSelect from "../../TeamAsyncSelect";
import UserAsyncSelect from "../../UserAsyncSelect";
import AuditScheduleAsyncSelect from "../../AuditScheduleAsyncSelect";

const AddOrganizationModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    teams: [],
    visitDate: "",
    revisitDate: "",
    auditors: [],
    previousAudit: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.teams.length === 0) {
      toast.error("Validation Error", {
        description: "Please select at least one team",
        duration: 3000,
      });
      return;
    }

    if (!formData.visitDate) {
      toast.error("Validation Error", {
        description: "Please select a visit date",
        duration: 3000,
      });
      return;
    }

    // Validate that visit date is not in the past
    const visitDateObj = new Date(formData.visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (visitDateObj < today) {
      toast.error("Validation Error", {
        description: "Visit date cannot be in the past",
        duration: 3000,
      });
      return;
    }

    // Validate revisit date if provided
    if (formData.revisitDate) {
      const revisitDateObj = new Date(formData.revisitDate);
      if (revisitDateObj <= visitDateObj) {
        toast.error("Validation Error", {
          description: "Revisit date must be after the visit date",
          duration: 3000,
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Process each team and create organization entries
      const organizations = {};
      
      for (const team of formData.teams) {
        organizations[team.id] = {
          teamName: team.name,
          status: 0, // 0: Scheduled, 1: In Progress, 2: Completed
          documents: {},
          visitDate: formData.visitDate,
          revisitDate: formData.revisitDate || null,
          findings: {},
          CAPA: {},
          auditors: formData.auditors,
          previousAudit: formData.previousAudit || {
            id: "",
            title: "",
            code: "",
            status: "",
          },
        };
      }

      // Call the parent's onAdd function with the organizations
      await onAdd(organizations);

      toast.success("Organizations Added", {
        description: `${formData.teams.length} team${formData.teams.length > 1 ? "s" : ""} added to audit schedule`,
        duration: 3000,
      });

      // Reset form
      setFormData({
        teams: [],
        visitDate: "",
        revisitDate: "",
        auditors: [],
        previousAudit: null,
      });
      onClose();
    } catch (error) {
      toast.error("Failed to Add Organizations", {
        description: `${error?.message || error || "Unknown error"}. Try again later or contact your System Administrator.`,
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      teams: [],
      visitDate: "",
      revisitDate: "",
      auditors: [],
      previousAudit: null,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Add Organization/Team to Audit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <TeamAsyncSelect
                value={formData.teams}
                onChange={(teams) =>
                  setFormData((prev) => ({ ...prev, teams }))
                }
                isRequired
              />

              <FormControl isRequired>
                <FormLabel>Visit Date</FormLabel>
                <Input
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      visitDate: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Revisit Date</FormLabel>
                <Input
                  type="date"
                  value={formData.revisitDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      revisitDate: e.target.value,
                    }))
                  }
                  min={formData.visitDate || new Date().toISOString().split("T")[0]}
                />
              </FormControl>

              <UserAsyncSelect
                value={formData.auditors}
                onChange={(auditors) =>
                  setFormData((prev) => ({ ...prev, auditors }))
                }
                label="Auditors"
                placeholder="Type at least 2 characters to search auditors..."
              />

              <AuditScheduleAsyncSelect
                value={formData.previousAudit}
                onChange={(audit) =>
                  setFormData((prev) => ({ ...prev, previousAudit: audit }))
                }
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Adding..."
            >
              Add to Audit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddOrganizationModal;
