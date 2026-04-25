import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import ActionPlanHistory from "./ActionPlanHistory";
import VerificationHistory from "./VerificationHistory";

const FindingHistory = ({
  readOnly = false,
  finding,
  isEditingActionPlan = false,
  setIsEditingActionPlan = () => {},
  organizationAuditors,
  team,
  handleSaveActionPlan = () => {},
  handleCancelActionPlan = () => {},
  isEditingVerification = false,
  setIsEditingVerification = () => {},
  isScheduleOngoing = true,
  needsActionPlan,
  handleSaveVerification = () => {},
  handleCancelVerification = () => {},
  show = ["actionPlans", "verifications"],
}) => {
  return (
    <Tabs>
      {show?.length > 1 && (
        <TabList>
          {show.includes("actionPlans") && <Tab>Action Plans</Tab>}
          {show.includes("verifications") && <Tab>Verifications</Tab>}
        </TabList>
      )}

      <TabPanels>
        {show.includes("actionPlans") && (
          <TabPanel py={2} pr={4} pl={2}>
            <ActionPlanHistory
              showLabel={false}
              {...{
                team,
                finding,
                isEditingActionPlan,
                setIsEditingActionPlan,
                organizationAuditors,
                handleSaveActionPlan,
                handleCancelActionPlan,
                readOnly,
              }}
            />
          </TabPanel>
        )}

        {show.includes("verifications") && (
          <TabPanel py={2} pr={4} pl={2}>
            <VerificationHistory
              showLabel={false}
              {...{
                finding,
                isEditingVerification,
                setIsEditingVerification,
                isScheduleOngoing,
                needsActionPlan,
                handleSaveVerification,
                handleCancelVerification,
                readOnly,
              }}
            />
          </TabPanel>
        )}
      </TabPanels>
    </Tabs>
  );
};

export default FindingHistory;
