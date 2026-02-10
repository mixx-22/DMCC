import { Box, Heading, Button, Flex } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Layout from "./layout";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import Can from "../../components/Can";

const Schedules = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Audit Schedules</Heading>
      </PageHeader>
      <Can to="audit.c">
        <PageFooter>
          <Flex gap={4} justifyContent="flex-end">
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brandPrimary"
              onClick={() => navigate("/audit-schedule/new")}
            >
              Create New Schedule
            </Button>
          </Flex>
        </PageFooter>
      </Can>
      <Layout />
    </Box>
  );
};

export default Schedules;
