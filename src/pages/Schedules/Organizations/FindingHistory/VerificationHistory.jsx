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
} from "@chakra-ui/react";
import moment from "moment";
import { FiPlus } from "react-icons/fi";
import VerificationForm from "../VerificationForm";
import Can from "../../../../components/Can";

const VerificationHistory = ({
  finding,
  isEditingVerification = false,
  setIsEditingVerification = () => {},
  isScheduleOngoing = true,
  needsActionPlan,
  handleSaveVerification = () => {},
  handleCancelVerification = () => {},
  readOnly = false,
  showLabel = true,
}) => {
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const plans = finding?.actionPlans || [];

  const verifications = plans.map((p, idx) => ({
    ...p,
    index: idx,
  }));

  if (!verifications.length) {
    return <Text fontSize="sm">No verifications yet.</Text>;
  }
  if (needsActionPlan) {
    return (
      <Center w="full" flexDir="column" minH="xs">
        <Text mb={2} fontSize="xs" color="gray.500" textAlign="center">
          No Action Plan Yet.
          <br />
          This organization still doesn&apos;t have an Action Plan set yet.
        </Text>
      </Center>
    );
  }
  return (
    <VStack align="stretch" spacing={4}>
      {showLabel && (
        <Text fontSize="sm" fontWeight="semibold" color="green.700">
          Verification History
        </Text>
      )}

      {finding.actionPlans && finding.actionPlans.length > 0 && (
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

              return (
                <AccordionItem
                  key={actionPlanItem.id || actionPlanIndex}
                  border="none"
                >
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
                      bg={isLatest ? "green.700" : "gray.400"}
                    />
                    <AccordionButton
                      p={0}
                      _hover={{ bg: "transparent" }}
                      _expanded={{ bg: "transparent" }}
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
                            colorScheme={isLatest ? "green" : "blackAlpha"}
                            fontSize="xs"
                          >
                            Action Plan Verification #{actionPlanIndex + 1}
                          </Badge>
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
                      <VStack align="stretch" spacing={4}>
                        {canVerifyThisPlan &&
                          isEditingVerification !== actionPlanIndex &&
                          !readOnly && (
                            <>
                              <Can to="audit.findings.u">
                                <Button
                                  size="sm"
                                  leftIcon={<FiPlus />}
                                  colorScheme="green"
                                  variant="outline"
                                  onClick={() => {
                                    setIsEditingVerification(actionPlanIndex);
                                  }}
                                >
                                  Verify
                                </Button>
                              </Can>
                            </>
                          )}
                        {isEditingVerification === actionPlanIndex && (
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
                        )}
                        {actionPlanItem.corrected !== undefined &&
                        actionPlanItem.corrected !== -1 ? (
                          <VerificationForm
                            initialData={{
                              corrected: actionPlanItem.corrected,
                              correctionDate: actionPlanItem.correctionDate,
                              remarks: actionPlanItem.remarks,
                            }}
                            readOnly={true}
                          />
                        ) : !canVerifyThisPlan ? (
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            textAlign="center"
                          >
                            Cannot verify - action plan has been verified.
                          </Text>
                        ) : (
                          ""
                        )}
                      </VStack>
                    </AccordionPanel>
                  </Box>
                </AccordionItem>
              );
            })}
        </Accordion>
      )}
    </VStack>
  );
};

export default VerificationHistory;
