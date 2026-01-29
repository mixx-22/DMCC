import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Divider,
  HStack,
  Spacer,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useOrganizations } from "../../../context/_useContext";
import { useCallback, useEffect, useState } from "react";
import TeamSingleAsyncSelect from "../../../components/TeamSingleAsyncSelect";
import { FiSave } from "react-icons/fi";
import UserAsyncSelect from "../../../components/UserAsyncSelect";
import VisitManager from "./VisitManager";
import { toast } from "sonner";

const OrganizationForm = ({ schedule = {} }) => {
  const bg = useColorModeValue("brandPrimary.50", "brandPrimary.200");
  const borderColor = useColorModeValue("brandPrimary.200", "brandPrimary.200");
  const { dispatch, scheduleId, organizations, createOrganization } =
    useOrganizations();

  const existingTeamIds = organizations.map((org) => org.team?.id);

  const [formData, setFormData] = useState({
    team: null,
    auditors: [],
    visits: [],
  });

  const [validationErrors, setValidationErrors] = useState({});

  const clearForm = () => {
    setFormData({
      team: null,
      auditors: [],
      visits: [],
    });
    setValidationErrors({});
  };

  useEffect(() => {
    clearForm();
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.team) {
      errors.team = "Team is required";
    } else if (
      existingTeamIds.includes(formData.team._id || formData.team.id)
    ) {
      errors.team = "This team is already added to this schedule";
    }

    if (!formData.auditors || formData.auditors.length === 0) {
      errors.auditors = "At least one auditor is required";
    }

    if (!formData.visits || formData.visits.length === 0) {
      errors.visits = "At least one auditor is required";
    }

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSaveOrganization = useCallback(
    async (organizationData, newOrgData) => {
      try {
        let result = await createOrganization(organizationData);

        if (result && result._id && schedule) {
          dispatch({
            type: "ADD_ORGANIZATION",
            payload: { ...newOrgData, _id: result._id },
          });
          clearForm();
        }
      } catch (error) {
        console.error("Failed to save organization:", error);
      }
    },
    [createOrganization, dispatch, schedule],
  );

  const handleSubmit = () => {
    const v = validateForm();
    if (v.isValid) {
      const base = {
        auditScheduleId: scheduleId,
        visits: formData.visits,
      };

      const payload = {
        ...base,
        team: formData.team._id ?? formData.team.id,
        auditors: formData.auditors.map((a) => a._id ?? a.id),
      };

      const newOrgData = {
        ...base,
        team: formData.team,
        auditors: formData.auditors,
      };

      handleSaveOrganization(payload, newOrgData);
    } else {
      toast.error("Failed to Add Organization", {
        description: Object.values(v.errors)?.[0],
        status: "success",
        duration: 3000,
      });
    }
  };

  const handleCancel = () => {
    setValidationErrors({});
  };

  return (
    <Card
      bg={bg}
      borderWidth={2}
      borderStyle="dashed"
      borderColor={borderColor}
    >
      <CardBody>
        <Stack spacing={4}>
          <TeamSingleAsyncSelect
            value={formData.team}
            placeholder="Start searching for Teams..."
            onChange={(team) => handleFieldChange("team", team)}
            isInvalid={!!validationErrors.team}
            label="Team"
          />
          <Divider />
          <UserAsyncSelect
            value={formData.auditors || []}
            placeholder="Start searching for Users..."
            onChange={(users) => handleFieldChange("auditors", users)}
            isInvalid={!!validationErrors.auditors}
            displayMode="none"
            label="Auditors"
            limit={5}
          />
          <Divider />
          <VisitManager
            visits={formData.visits}
            onChange={(visits) => handleFieldChange("visits", visits)}
            isInvalid={!!validationErrors.visits}
          />
        </Stack>
      </CardBody>
      <CardFooter>
        <HStack w="full">
          <Spacer />
          <ButtonGroup>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              colorScheme="brandPrimary"
              onClick={handleSubmit}
              leftIcon={<FiSave />}
            >
              {"Add Organization"}
            </Button>
          </ButtonGroup>
        </HStack>
      </CardFooter>
    </Card>
  );
};

OrganizationForm.propTypes = {};

export default OrganizationForm;
