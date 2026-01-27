import { Box, Heading, Button, Flex } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Layout from "./layout";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import Can from "../../components/Can";

const Teams = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Teams</Heading>
      </PageHeader>
      <Can to="teams.c">
        <PageFooter>
          <Flex gap={4} justifyContent="flex-end">
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brandPrimary"
              onClick={() => navigate("/teams/new")}
            >
              Create New Team
            </Button>
          </Flex>
        </PageFooter>
      </Can>
      <Layout />
    </Box>
  );
};

export default Teams;
