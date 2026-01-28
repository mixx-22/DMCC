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
} from "@chakra-ui/react";
import { useOrganizations } from "../../../context/_useContext";
import { useEffect, useState } from "react";
import TeamSingleAsyncSelect from "../../../components/TeamSingleAsyncSelect";
import { FiSave } from "react-icons/fi";
import UserAsyncSelect from "../../../components/UserAsyncSelect";
import VisitManager from "./VisitManager";

const OrganizationForm = ({
  schedule = {},
  setFormData: setScheduleFormData = () => {},
}) => {
  const { scheduleId, organizations, createOrganization, updateOrganization } =
    useOrganizations();

  const existingTeamIds = organizations.map((org) => org.teamId);

  const [formData, setFormData] = useState({
    team: null,
    auditors: [],
    visits: [],
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setFormData({
      team: null,
      auditors: [],
      visits: [],
    });
    setValidationErrors({});
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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const handleSaveOrganization = async (organizationData, newOrgData) => {
    try {
      let result;
      if (selectedOrganization) {
        result = await updateOrganization(
          selectedOrganization._id,
          organizationData,
        );
      } else {
        result = await createOrganization(organizationData);

        if (result && result._id && schedule) {
          const updatedSchedule = {
            ...schedule,
            organizations: [...(schedule.organizations || []), newOrgData],
          };
          setScheduleFormData((prev) => ({ ...prev, ...updatedSchedule }));
        }
      }
      setSelectedOrganization(null);
    } catch (error) {
      console.error("Failed to save organization:", error);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const base = {
        auditScheduleId: scheduleId,
        visits: formData.visits,
      };

      const payload = {
        ...base,
        teamId: formData.team._id ?? formData.team.id,
        auditors: formData.auditors.map((a) => a._id ?? a.id),
      };

      const newOrgData = {
        ...base,
        teamId: formData.team,
        auditors: formData.auditors,
      };

      handleSaveOrganization(payload, newOrgData);
    }
  };

  const handleCancel = () => {
    setValidationErrors({});
  };

  return (
    <Card>
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
