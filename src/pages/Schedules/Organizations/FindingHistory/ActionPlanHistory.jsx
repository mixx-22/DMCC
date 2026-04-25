import {
  Box,
  VStack,
  Text,
  Badge,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Button,
  Center,
  useColorModeValue,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import moment from "moment";
import ActionPlanForm from "../ActionPlanForm";
import { FiCheckCircle, FiPlus } from "react-icons/fi";
import Can from "../../../../components/Can";
import VerificationForm from "../VerificationForm";

const ActionPlanHistory = ({
  finding,
  isEditingVerification = false,
  setIsEditingVerification = () => {},
  isScheduleOngoing = true,
  handleSaveVerification = () => {},
  handleCancelVerification = () => {},
  isEditingActionPlan = false,
  setIsEditingActionPlan = () => {},
  organizationAuditors,
  team,
  handleSaveActionPlan = () => {},
  handleCancelActionPlan = () => {},
  readOnly = false,
  showLabel = true,
}) => {
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const plans = finding?.actionPlans || [];

  if (!plans.length) {
    return <Text fontSize="sm">No action plans available.</Text>;
  }

  return (
    <VStack align="stretch" spacing={4}>
      {finding.actionPlans && finding.actionPlans.length > 0 && (
        <VStack align="stretch" spacing={4}>
          {showLabel && (
            <Text fontSize="sm" fontWeight="semibold" color="info.700">
              Action Plan History
            </Text>
          )}
          <Accordion
            allowMultiple
            defaultIndex={[finding.actionPlans.length - 1]}
            border="none"
          >
            {[...finding.actionPlans]
              .slice()
              .map((actionPlanItem, actionPlanIndex) => {
                const isLatest =
                  finding.actionPlans.length - 1 === actionPlanIndex;
                const canVerifyThisPlan =
                  (actionPlanItem.corrected === undefined ||
                    actionPlanItem.corrected === -1) &&
                  isScheduleOngoing;

                const isVerified = actionPlanItem.corrected > 0;

                const isEditing = isEditingVerification === actionPlanIndex;

                const canShowVerifyButton = canVerifyThisPlan && !readOnly;

                return (
                  <AccordionItem
                    key={actionPlanItem.id || actionPlanIndex}
                    border="none"
                  >
                    {({ isExpanded }) => {
                      return (
                        <Box position="relative" pl={10}>
                          {!isLatest && (
                            <Box
                              position="absolute"
                              left={4}
                              top={4}
                              width="2px"
                              height="100%"
                              bg="gray.200"
                            />
                          )}
                          <Box
                            position="absolute"
                            left={"11px"}
                            top={4}
                            width={3}
                            height={3}
                            borderRadius="full"
                            bg={isLatest ? "brandPrimary.500" : "gray.400"}
                          />
                          <AccordionButton
                            p={0}
                            _hover={{ bg: "transparent" }}
                            _expanded={{
                              bg: "transparent",
                            }}
                          >
                            <HStack
                              justify="space-between"
                              align="center"
                              w="full"
                              spacing={3}
                              py={3}
                            >
                              <HStack spacing={3} flex={1}>
                                <Badge
                                  colorScheme={isLatest ? "info" : "blackAlpha"}
                                  fontSize="xs"
                                >
                                  Action Plan #{actionPlanIndex + 1}
                                </Badge>
                                {actionPlanItem.corrected === 1 ||
                                  (actionPlanItem.corrected === 2 && (
                                    <Badge colorScheme={"green"} fontSize="xs">
                                      Corrective
                                    </Badge>
                                  ))}
                                {!isExpanded &&
                                  actionPlanItem.corrected <= 1 && (
                                    <Text
                                      fontSize="sm"
                                      color={labelColor}
                                      noOfLines={1}
                                      flex={1}
                                      textAlign="left"
                                    >
                                      {actionPlanItem.actionPlan
                                        .correctiveAction ||
                                        actionPlanItem.actionPlan.rootCause ||
                                        "Action plan details"}
                                    </Text>
                                  )}
                              </HStack>
                              <HStack spacing={2}>
                                <Text fontSize="xs" color={labelColor}>
                                  {actionPlanItem.createdAt
                                    ? moment(actionPlanItem.createdAt).format(
                                        "MMM DD, YYYY",
                                      )
                                    : ""}
                                </Text>
                                <AccordionIcon />
                              </HStack>
                            </HStack>
                          </AccordionButton>
                          <AccordionPanel px={0} pb={4}>
                            <VStack w="full" mb={4}>
                              {isEditing ? (
                                <Box w="full">
                                  <VerificationForm
                                    initialData={{
                                      corrected: -1,
                                      correctionDate: new Date(),
                                      remarks: "",
                                    }}
                                    onSave={(data) =>
                                      handleSaveVerification(
                                        data,
                                        isEditingVerification,
                                      )
                                    }
                                    onCancel={handleCancelVerification}
                                    readOnly={false}
                                  />
                                </Box>
                              ) : (
                                <>
                                  <Box
                                    w="full"
                                    mb={2}
                                    p={2}
                                    bg={isVerified ? "green.50" : "red.50"}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor={
                                      isVerified ? "green.200" : "red.200"
                                    }
                                  >
                                    <HStack spacing={2} mb={2} align="center">
                                      <Box flex={1}>
                                        <Text
                                          mb={2}
                                          fontSize="xs"
                                          fontWeight="semibold"
                                          color={
                                            isVerified ? "green.700" : "red.700"
                                          }
                                        >
                                          Verification Status
                                        </Text>
                                      </Box>
                                      <Box>
                                        {canShowVerifyButton && (
                                          <Can to="audit.findings.u">
                                            <Flex w="full">
                                              <Spacer />
                                              <Button
                                                size="sm"
                                                leftIcon={<FiCheckCircle />}
                                                colorScheme="green"
                                                variant="outline"
                                                onClick={() =>
                                                  setIsEditingVerification(
                                                    actionPlanIndex,
                                                  )
                                                }
                                              >
                                                Verify
                                              </Button>
                                            </Flex>
                                          </Can>
                                        )}
                                      </Box>
                                    </HStack>

                                    <VerificationForm
                                      initialData={{
                                        corrected: actionPlanItem.corrected,
                                        correctionDate:
                                          actionPlanItem.correctionDate,
                                        remarks: actionPlanItem.remarks,
                                      }}
                                      readOnly={true}
                                    />
                                  </Box>
                                </>
                              )}
                            </VStack>
                            <ActionPlanForm
                              initialData={actionPlanItem.actionPlan}
                              organizationAuditors={organizationAuditors}
                              team={team}
                              readOnly={true}
                            />
                          </AccordionPanel>
                        </Box>
                      );
                    }}
                  </AccordionItem>
                );
              })}
          </Accordion>
        </VStack>
      )}

      {/* Add new action plan */}
      {!readOnly && (
        <>
          {isEditingActionPlan ? (
            <ActionPlanForm
              initialData={null}
              organizationAuditors={organizationAuditors}
              team={team}
              onSave={handleSaveActionPlan}
              onCancel={handleCancelActionPlan}
              readOnly={false}
            />
          ) : (
            <Center w="full" flexDir="column" minH="28">
              <Can
                to="audit.response.c"
                fallback={
                  <>
                    <Text
                      mb={2}
                      fontSize="xs"
                      color="gray.500"
                      textAlign="center"
                    >
                      {finding.actionPlans && finding.actionPlans.length > 0
                        ? "No additional action plans needed."
                        : "No Action Plan Set Yet. Wait for the team leader to add one."}
                    </Text>
                  </>
                }
              >
                {finding.actionPlans && finding.actionPlans.length > 0 ? (
                  (() => {
                    const latestActionPlan =
                      finding.actionPlans[finding.actionPlans.length - 1];
                    const canAddAnother =
                      !finding.actionPlans ||
                      finding.actionPlans.length === 0 ||
                      latestActionPlan?.corrected === 0;

                    return canAddAnother ? (
                      <>
                        <Text
                          mb={2}
                          fontSize="xs"
                          color="gray.500"
                          textAlign="center"
                        >
                          {finding.actionPlans.length > 1
                            ? "The recent action plan was verified as non-corrective. Add another action plan as necessary."
                            : "The action plan was verified as non-corrective. Add another action plan as necessary."}
                        </Text>
                        {!readOnly && (
                          <Button
                            size="sm"
                            leftIcon={<FiPlus />}
                            colorScheme="brandPrimary"
                            variant="outline"
                            onClick={() => setIsEditingActionPlan(true)}
                          >
                            Add Another Action Plan
                          </Button>
                        )}
                      </>
                    ) : (
                      <Text
                        mb={2}
                        fontSize="xs"
                        color="gray.500"
                        textAlign="center"
                      >
                        {latestActionPlan?.corrected === 2 ||
                        latestActionPlan?.corrected === 1
                          ? "The latest action plan has been verified as corrective. No additional action plans needed."
                          : latestActionPlan?.corrected === -1
                            ? "The latest action plan is still pending verification. No additional action plans can be added yet."
                            : "The latest action plan verification status is undetermined. No additional action plans can be added yet."}
                      </Text>
                    );
                  })()
                ) : (
                  <>
                    <Text
                      mb={2}
                      fontSize="xs"
                      color="gray.500"
                      textAlign="center"
                    >
                      No Action Plan Set Yet. Add one now by clicking the button
                      below.
                    </Text>
                    {!readOnly && (
                      <Button
                        size="sm"
                        leftIcon={<FiPlus />}
                        colorScheme="brandPrimary"
                        variant="outline"
                        onClick={() => setIsEditingActionPlan(true)}
                      >
                        Add Action Plan
                      </Button>
                    )}
                  </>
                )}
              </Can>
            </Center>
          )}
        </>
      )}
    </VStack>
  );
};

export default ActionPlanHistory;
